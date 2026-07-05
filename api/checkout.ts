import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, uuid, text, jsonb, numeric } from "drizzle-orm/pg-core";
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

// ── Asaas client ─────────────────────────────────────────────────────────────
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
        if (res.status === 408 || res.status === 429 || res.status >= 500) throw new Error(`transient ${res.status}`);
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

async function findOrCreateCustomer(nome: string, cpf?: string): Promise<string> {
  const c = await asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify({ name: nome, cpfCnpj: cpf || undefined, notificationDisabled: true }),
  });
  return c.id as string;
}

// ── helpers puros (exportados p/ teste) ──────────────────────────────────────
export const CHARGE_DESCRIPTION = "Catarina e Lucia - Presente"; // NUNCA "créditos"/"bônus"

export function cpfDigits(v?: string) {
  return (v ?? "").replace(/\D/g, "");
}
export function cpfValido(v?: string) {
  const d = cpfDigits(v);
  return d.length === 11 && !/^(\d)\1{10}$/.test(d);
}

export function buildChargeBody(
  customerId: string,
  valorReais: number,
  externalReference: string,
  billingType: "PIX" | "CREDIT_CARD",
) {
  return {
    customer: customerId,
    billingType,
    value: valorReais, // REAIS
    description: CHARGE_DESCRIPTION,
    externalReference, // uuid puro (isolamento por presença na nossa tabela)
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    // SEM callback.successUrl (domínio não-whitelisted derruba o cartão, #16)
    // SEM creditCard payload → cartão devolve invoiceUrl (checkout hospedado)
  };
}

async function createCharge(customerId: string, valor: number, ref: string, billingType: "PIX" | "CREDIT_CARD") {
  return asaasFetch("/payments", {
    method: "POST",
    body: JSON.stringify(buildChargeBody(customerId, valor, ref, billingType)),
  }) as Promise<{ id: string; status: string; invoiceUrl?: string }>;
}

async function getPixQrCode(asaasId: string) {
  const j = (await asaasFetch(`/payments/${asaasId}/pixQrCode`)) as { encodedImage?: string; payload?: string };
  return { qrCodeImage: j.encodedImage ?? "", copiaECola: j.payload ?? "" };
}

export class CheckoutError extends Error {
  constructor(public code: number, msg: string) {
    super(msg);
  }
}

export type CheckoutInput = {
  metodo: "pix" | "cartao";
  nomeRemetente: string;
  cpf?: string;
  mensagem?: string;
  itens: Item[];
};
export type CheckoutResult = {
  orderId: string;
  status: string;
  invoiceUrl?: string | null;
  pix?: { qrCodeImage: string; copiaECola: string };
};

// Usado pelo handler da Vercel E pelo plugin de dev do Vite.
export async function runCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const db = getDb();
  const nome = (input.nomeRemetente ?? "").trim();
  const itens = Array.isArray(input.itens) ? input.itens : [];
  const total = itens.reduce((s, i) => s + Number(i.preco) * Math.max(1, Math.round(Number(i.quantidade) || 1)), 0);

  if (!nome || itens.length === 0 || total <= 0) throw new CheckoutError(400, "nome e ao menos um item são obrigatórios");
  if (input.metodo === "pix" && !cpfValido(input.cpf)) throw new CheckoutError(400, "CPF inválido (necessário para o Pix)");

  const orderId = randomUUID();
  await db.insert(orders).values({
    id: orderId,
    externalReference: orderId,
    status: "pending",
    metodo: input.metodo === "pix" ? "asaas_pix" : "asaas_card",
    valor: total.toFixed(2),
    nomeRemetente: nome,
    mensagem: (input.mensagem ?? "").trim(),
    itens,
  });

  try {
    const cpf = input.cpf ? cpfDigits(input.cpf) : undefined;
    const customerId = await findOrCreateCustomer(nome, cpf);
    const billingType = input.metodo === "pix" ? "PIX" : "CREDIT_CARD";
    const charge = await createCharge(customerId, total, orderId, billingType);
    await db.update(orders).set({ asaasId: charge.id, asaasCustomerId: customerId }).where(eq(orders.id, orderId));

    if (input.metodo === "pix") {
      const pix = await getPixQrCode(charge.id);
      return { orderId, status: charge.status, pix };
    }
    return { orderId, status: charge.status, invoiceUrl: charge.invoiceUrl ?? null };
  } catch (e) {
    const validation = e instanceof AsaasApiError;
    await db
      .update(orders)
      .set({ status: validation ? "abandoned" : "gateway_down" })
      .where(eq(orders.id, orderId))
      .catch(() => {});
    throw new CheckoutError(validation ? 400 : 502, "não foi possível criar a cobrança");
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
    const result = await runCheckout({
      metodo: body.metodo === "pix" ? "pix" : "cartao",
      nomeRemetente: String(body.nomeRemetente ?? ""),
      cpf: body.cpf ? String(body.cpf) : undefined,
      mensagem: String(body.mensagem ?? ""),
      itens: Array.isArray(body.itens) ? body.itens : [],
    });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof CheckoutError) {
      res.status(err.code).json({ error: err.message });
      return;
    }
    console.error("[checkout]", err);
    res.status(500).json({ error: "erro no servidor" });
  }
}
