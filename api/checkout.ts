import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, uuid, text, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

// auto-contido (Vercel não empacota imports locais)
type Item = { giftId: string; nome: string; empresa?: string; preco: number; quantidade: number };

const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalReference: text("external_reference").notNull(),
  asaasId: text("asaas_id"),
  asaasCustomerId: text("asaas_customer_id"),
  status: text("status").notNull().default("pending"),
  metodo: text("metodo").notNull().default("asaas_card"),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull(),
  nomeRemetente: text("nome_remetente").notNull(),
  mensagem: text("mensagem").notNull().default(""),
  itens: jsonb("itens").$type<Item[]>().notNull().default([]),
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

// ── Asaas client (auto-contido) ──────────────────────────────────────────────
function asaasKey() {
  return (process.env.ASAAS_API_KEY || "").replace(/^\\+/, "");
}
const ASAAS_BASE = (process.env.ASAAS_BASE_URL || "https://api.asaas.com/v3").replace(/\/$/, "");
const RETRY_DELAYS = [500, 1500, 3000];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

class AsaasApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`Asaas ${status}: ${body.slice(0, 300)}`);
  }
}

async function asaasFetch(path: string, init: RequestInit = {}): Promise<any> {
  let lastErr: unknown;
  for (let i = 0; i <= RETRY_DELAYS.length; i++) {
    try {
      const res = await fetch(`${ASAAS_BASE}${path}`, {
        ...init,
        headers: { access_token: asaasKey(), "Content-Type": "application/json", ...(init.headers || {}) },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        const b = await res.text();
        // retry só transitório; 4xx de validação aborta na hora
        if (res.status === 408 || res.status === 429 || res.status >= 500) throw new Error(`transient ${res.status}: ${b.slice(0, 120)}`);
        throw new AsaasApiError(res.status, b);
      }
      return await res.json();
    } catch (e) {
      if (e instanceof AsaasApiError) throw e;
      lastErr = e;
      if (i < RETRY_DELAYS.length) await sleep(RETRY_DELAYS[i]);
    }
  }
  throw lastErr;
}

async function findOrCreateCustomer(nome: string): Promise<string> {
  const c = await asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify({ name: nome, notificationDisabled: true }),
  });
  return c.id as string;
}

// ── builder da cobrança (puro, exportado p/ teste) ───────────────────────────
export const CHARGE_DESCRIPTION = "Catarina e Lucia - Presente"; // NUNCA "créditos"/"bônus"

export function buildChargeBody(customerId: string, valorReais: number, externalReference: string) {
  return {
    customer: customerId,
    billingType: "CREDIT_CARD" as const,
    value: valorReais, // REAIS, não centavos
    description: CHARGE_DESCRIPTION,
    externalReference, // uuid puro (isolamento por presença na nossa tabela)
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    // SEM callback.successUrl (domínio não-whitelisted derruba 100% dos cartões, #16)
    // SEM creditCard payload → Asaas devolve invoiceUrl (checkout hospedado, parcelas lá)
  };
}

async function createCharge(customerId: string, valorReais: number, externalReference: string) {
  return asaasFetch("/payments", {
    method: "POST",
    body: JSON.stringify(buildChargeBody(customerId, valorReais, externalReference)),
  }) as Promise<{ id: string; status: string; invoiceUrl?: string }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  const db = getDb();
  let orderId = "";
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
    const nomeRemetente = String(body.nomeRemetente ?? "").trim();
    const mensagem = String(body.mensagem ?? "").trim();
    const itens: Item[] = Array.isArray(body.itens) ? body.itens : [];
    const total = itens.reduce((s, i) => s + Number(i.preco) * Math.max(1, Math.round(Number(i.quantidade) || 1)), 0);

    if (!nomeRemetente || itens.length === 0 || total <= 0) {
      res.status(400).json({ error: "nomeRemetente e ao menos um item são obrigatórios" });
      return;
    }

    orderId = randomUUID();
    await db.insert(orders).values({
      id: orderId,
      externalReference: orderId,
      status: "pending",
      metodo: "asaas_card",
      valor: total.toFixed(2),
      nomeRemetente,
      mensagem,
      itens,
    });

    const customerId = await findOrCreateCustomer(nomeRemetente);
    const charge = await createCharge(customerId, total, orderId);
    await db
      .update(orders)
      .set({ asaasId: charge.id, asaasCustomerId: customerId })
      .where(eq(orders.id, orderId));

    res.status(201).json({ orderId, invoiceUrl: charge.invoiceUrl ?? null, status: charge.status });
  } catch (err) {
    // 4xx de validação → abandona (terminal); transitório → gateway_down (recuperável)
    const validation = err instanceof AsaasApiError;
    if (orderId) {
      await db
        .update(orders)
        .set({ status: validation ? "abandoned" : "gateway_down" })
        .where(eq(orders.id, orderId))
        .catch(() => {});
    }
    console.error("[checkout]", err);
    res.status(validation ? 400 : 502).json({ error: "não foi possível criar a cobrança" });
  }
}
