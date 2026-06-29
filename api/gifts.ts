import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { desc } from "drizzle-orm";

// Tudo num arquivo só (sem imports de arquivos locais) para a função empacotar
// corretamente na Vercel — só dependências de node_modules, que funcionam no runtime.

export const gifts = pgTable("gifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomeRemetente: text("nome_remetente").notNull(),
  mensagem: text("mensagem").notNull().default(""),
  giftId: text("gift_id").notNull(),
  giftNome: text("gift_nome").notNull(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export type GiftRow = {
  id: string;
  nomeRemetente: string;
  mensagem: string;
  giftId: string;
  giftNome: string;
  criadoEm: number;
};

let _db: ReturnType<typeof drizzle> | null = null;
function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL não configurada no ambiente");
    _db = drizzle(neon(url));
  }
  return _db;
}

function toRow(r: typeof gifts.$inferSelect): GiftRow {
  return {
    id: r.id,
    nomeRemetente: r.nomeRemetente,
    mensagem: r.mensagem,
    giftId: r.giftId,
    giftNome: r.giftNome,
    criadoEm: r.criadoEm.getTime(),
  };
}

export async function listGifts(): Promise<GiftRow[]> {
  const rows = await getDb().select().from(gifts).orderBy(desc(gifts.criadoEm));
  return rows.map(toRow);
}

export async function createGift(input: {
  nomeRemetente: string;
  mensagem: string;
  giftId: string;
  giftNome: string;
}): Promise<GiftRow> {
  const [row] = await getDb().insert(gifts).values(input).returning();
  return toRow(row);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      res.status(200).json(await listGifts());
      return;
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
      const nomeRemetente = String(body.nomeRemetente ?? "").trim();
      const mensagem = String(body.mensagem ?? "").trim();
      const giftId = String(body.giftId ?? "");
      const giftNome = String(body.giftNome ?? "");

      if (!nomeRemetente || !giftId) {
        res.status(400).json({ error: "nomeRemetente e giftId são obrigatórios" });
        return;
      }

      res.status(201).json(await createGift({ nomeRemetente, mensagem, giftId, giftNome }));
      return;
    }

    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    console.error("[api/gifts]", err);
    res.status(500).json({ error: "erro no servidor", detail: err instanceof Error ? err.message : String(err) });
  }
}
