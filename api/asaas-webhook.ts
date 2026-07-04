import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, uuid, text, timestamp, jsonb, integer, numeric } from "drizzle-orm/pg-core";
import { and, eq, inArray } from "drizzle-orm";
import { timingSafeEqual } from "node:crypto";

// ── schema (auto-contido; a Vercel não empacota imports locais) ──────────────
type Item = { giftId: string; nome: string; empresa?: string; preco: number; quantidade: number };

const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalReference: text("external_reference").notNull(),
  asaasId: text("asaas_id"),
  status: text("status").notNull().default("pending"),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull(),
  nomeRemetente: text("nome_remetente").notNull(),
  mensagem: text("mensagem").notNull().default(""),
  itens: jsonb("itens").$type<Item[]>().notNull().default([]),
  giftId: uuid("gift_id"),
  confirmadoEm: timestamp("confirmado_em", { withTimezone: true }),
});

const gifts = pgTable("gifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomeRemetente: text("nome_remetente").notNull(),
  mensagem: text("mensagem").notNull().default(""),
  itens: jsonb("itens").$type<Item[]>().notNull().default([]),
  total: integer("total").notNull().default(0),
});

let _db: ReturnType<typeof drizzle> | null = null;
function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL não configurada");
    _db = drizzle(neon(url));
  }
  return _db;
}

// ── Asaas: re-verificação de status (nunca confie no payload) ────────────────
function asaasKey() {
  return (process.env.ASAAS_API_KEY || "").replace(/^\\+/, ""); // tolera "\$" do .env
}
const ASAAS_BASE = (process.env.ASAAS_BASE_URL || "https://api.asaas.com/v3").replace(/\/$/, "");

async function getChargeStatus(asaasId: string): Promise<string> {
  const res = await fetch(`${ASAAS_BASE}/payments/${asaasId}`, {
    headers: { access_token: asaasKey(), "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Asaas ${res.status}`);
  const j = (await res.json()) as { status?: string };
  return j.status ?? "";
}

// ── constantes / helpers puros (exportados p/ teste) ─────────────────────────
export const CONFIRMED_EVENTS = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "PAYMENT_RECEIVED_IN_CASH"];
export const VALID_STATUSES = ["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"];

// comparação de tempo constante do token do header (não isola o app, só autentica o Asaas)
export function tokenOk(header: string): boolean {
  const secret = process.env.ASAAS_WEBHOOK_SECRET || "";
  if (!secret || header.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(secret));
}

export type OrderLite = { id: string; asaasId: string | null };
export type WebhookDeps = {
  findOrder: (externalRef: string) => Promise<OrderLite | null>;
  verifyCharge: (asaasId: string) => Promise<string>;
  creditOrder: (orderId: string) => Promise<boolean>;
  markOverdue: (orderId: string) => Promise<void>;
  refundOrder: (orderId: string) => Promise<void>;
};

// Núcleo do webhook. SEMPRE 200. Isolamento: ref ausente OU não encontrado na NOSSA
// tabela → no-op ANTES de qualquer efeito (eventos de Breolab/Bewrite/Curriculol caem aqui).
export async function handleWebhookEvent(deps: WebhookDeps, body: any): Promise<Record<string, unknown>> {
  const event: string = body?.event ?? "";
  const ref: string = body?.payment?.externalReference ?? "";

  if (body?.payment?.subscription) return { received: true, ignored: "subscription" };
  if (!ref) return { received: true, ignored: "no-ref" };

  const order = await deps.findOrder(String(ref));
  if (!order) return { received: true, ignored: "foreign-ref" }; // não é nosso

  if (CONFIRMED_EVENTS.includes(event)) {
    if (order.asaasId) {
      const st = await deps.verifyCharge(order.asaasId); // re-verifica na API do Asaas
      if (!VALID_STATUSES.includes(st)) return { received: true, verified: false };
    }
    const credited = await deps.creditOrder(order.id);
    return { received: true, credited };
  }
  if (event === "PAYMENT_OVERDUE") {
    await deps.markOverdue(order.id);
    return { received: true, overdue: true };
  }
  if (event === "PAYMENT_REFUNDED") {
    await deps.refundOrder(order.id);
    return { received: true, refunded: true };
  }
  return { received: true };
}

// ── deps reais (Neon/Drizzle) ────────────────────────────────────────────────
function realDeps(): WebhookDeps {
  const db = getDb();
  return {
    findOrder: async (ref) => {
      const [o] = await db.select().from(orders).where(eq(orders.externalReference, ref)).limit(1);
      return o ? { id: o.id, asaasId: o.asaasId } : null;
    },
    verifyCharge: getChargeStatus,
    creditOrder: async (orderId) => {
      // CAS: só credita quem estava recuperável; vencedor único materializa o presente na mesa.
      const [won] = await db
        .update(orders)
        .set({ status: "confirmed", confirmadoEm: new Date() })
        .where(and(eq(orders.id, orderId), inArray(orders.status, ["pending", "overdue", "gateway_down"])))
        .returning();
      if (!won) return false;
      const [g] = await db
        .insert(gifts)
        .values({
          nomeRemetente: won.nomeRemetente,
          mensagem: won.mensagem,
          itens: won.itens,
          total: Math.round(Number(won.valor)),
        })
        .returning();
      await db.update(orders).set({ giftId: g.id }).where(eq(orders.id, orderId));
      return true;
    },
    markOverdue: async (orderId) => {
      await db.update(orders).set({ status: "overdue" }).where(and(eq(orders.id, orderId), eq(orders.status, "pending")));
    },
    refundOrder: async (orderId) => {
      // reverte status e remove o presente da mesa, na mesma "ideia" transacional (CAS em confirmed)
      const [flipped] = await db
        .update(orders)
        .set({ status: "refunded" })
        .where(and(eq(orders.id, orderId), eq(orders.status, "confirmed")))
        .returning();
      if (flipped?.giftId) await db.delete(gifts).where(eq(gifts.id, flipped.giftId));
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const header = String(req.headers["asaas-access-token"] ?? "");
    if (!tokenOk(header)) {
      res.status(401).json({ error: "invalid token" });
      return;
    }
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
    const result = await handleWebhookEvent(realDeps(), body);
    res.status(200).json(result);
  } catch (err) {
    // SEMPRE 200: um erro nosso não pode fazer o Asaas marcar o webhook como interrupted.
    // O reconciler é a rede de segurança.
    console.error("[asaas-webhook]", err);
    res.status(200).json({ received: true, error: true });
  }
}
