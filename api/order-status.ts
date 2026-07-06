import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

// auto-contido (a Vercel não empacota imports locais). Só lê o status do pedido
// pra tela de checkout ficar "aguardando pagamento" e reagir quando confirmar.
// A tabela orders é NOSSA (Neon) — o id é um uuid não-adivinhável e só devolvemos
// status + giftId, então não há vazamento entre apps do Asaas compartilhado.
const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: text("status").notNull().default("pending"),
  giftId: uuid("gift_id"),
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type OrderStatus = { status: string; giftId: string | null };

// Guarda o formato do id ANTES de tocar o banco (uuid inválido → null, sem query).
export async function getOrderStatus(id: string): Promise<OrderStatus | null> {
  if (!UUID_RE.test(id)) return null;
  const [o] = await getDb()
    .select({ status: orders.status, giftId: orders.giftId })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return o ? { status: o.status, giftId: o.giftId ?? null } : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "method not allowed" });
    return;
  }
  try {
    const raw = req.query?.id;
    const id = String((Array.isArray(raw) ? raw[0] : raw) ?? "");
    const r = await getOrderStatus(id);
    if (!r) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.status(200).json(r);
  } catch (err) {
    console.error("[order-status]", err);
    res.status(500).json({ error: "erro no servidor" });
  }
}
