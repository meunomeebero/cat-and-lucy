import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, uuid, text, timestamp, jsonb, integer, numeric } from "drizzle-orm/pg-core";
import { and, eq, inArray } from "drizzle-orm";

// Rede de segurança: se um webhook não creditou, esta rotina (Vercel Cron) varre os
// pagamentos da conta e credita os NOSSOS que faltaram. Também reativa o nosso webhook
// se o Asaas o tiver auto-pausado (interrupted). Roda pelo Cron da Vercel.

const OUR_WEBHOOK_URL = "https://cat-and-lucy.vercel.app/api/asaas-webhook";
const REQUIRED_EVENTS = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED", "PAYMENT_OVERDUE", "PAYMENT_REFUNDED"];
const SETTLED = ["CONFIRMED", "RECEIVED"]; // varre os dois: cartão fica CONFIRMED ~30d até virar RECEIVED

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

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL");
  return drizzle(neon(url));
}
function asaasKey() {
  return (process.env.ASAAS_API_KEY || "").replace(/^\\+/, "");
}
const ASAAS_BASE = (process.env.ASAAS_BASE_URL || "https://api.asaas.com/v3").replace(/\/$/, "");
async function asaasGet(path: string) {
  const res = await fetch(`${ASAAS_BASE}${path}`, {
    headers: { access_token: asaasKey(), "Content-Type": "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Asaas ${res.status}`);
  return res.json();
}

type DB = ReturnType<typeof getDb>;

async function creditIfOurs(db: DB, externalReference: string): Promise<boolean> {
  const [won] = await db
    .update(orders)
    .set({ status: "confirmed", confirmadoEm: new Date() })
    .where(and(eq(orders.externalReference, externalReference), inArray(orders.status, ["pending", "overdue", "gateway_down"])))
    .returning();
  if (!won) return false; // não é nosso, ou já confirmado
  const [g] = await db
    .insert(gifts)
    .values({ nomeRemetente: won.nomeRemetente, mensagem: won.mensagem, itens: won.itens, total: Math.round(Number(won.valor)) })
    .returning();
  await db.update(orders).set({ giftId: g.id }).where(eq(orders.id, won.id));
  return true;
}

async function sweep(db: DB): Promise<number> {
  let credited = 0;
  for (const status of SETTLED) {
    let offset = 0;
    for (let guard = 0; guard < 50; guard++) {
      const page = (await asaasGet(`/payments?status=${status}&limit=100&offset=${offset}`)) as {
        data?: { externalReference?: string }[];
        hasMore?: boolean;
      };
      const rows = page.data ?? [];
      for (const p of rows) {
        if (!p.externalReference) continue; // hard-filter: só refs que batem na NOSSA tabela creditam
        if (await creditIfOurs(db, p.externalReference).catch(() => false)) credited++;
      }
      if (!page.hasMore || rows.length < 100) break;
      offset += 100;
    }
  }
  return credited;
}

async function healWebhook(): Promise<string> {
  const list = (await asaasGet("/webhooks")) as { data?: any[] };
  const ours = (list.data ?? []).find((w) => w.url === OUR_WEBHOOK_URL);
  if (!ours) return "webhook-nao-encontrado";
  if (!ours.enabled) return "webhook-desabilitado (intervir)";
  if (ours.hasAuthToken !== true) return "webhook-sem-token (intervir)";
  if (!REQUIRED_EVENTS.every((e) => (ours.events ?? []).includes(e))) return "webhook-faltam-eventos (intervir)";
  if (ours.interrupted) {
    await fetch(`${ASAAS_BASE}/webhooks/${ours.id}`, {
      method: "PUT",
      headers: { access_token: asaasKey(), "Content-Type": "application/json" },
      body: JSON.stringify({ interrupted: false }),
    });
    return "webhook-reativado";
  }
  return "webhook-ok";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const db = getDb();
    const credited = await sweep(db);
    const webhook = await healWebhook().catch((e) => `erro: ${String(e).slice(0, 80)}`);
    res.status(200).json({ ok: true, credited, webhook });
  } catch (err) {
    console.error("[reconcile]", err);
    res.status(500).json({ error: "reconcile failed", detail: err instanceof Error ? err.message : String(err) });
  }
}
