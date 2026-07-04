import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, uuid, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { desc } from "drizzle-orm";

// Arquivo único (sem imports de arquivos locais) para a função empacotar na Vercel.

type SubmissionItem = {
  giftId: string;
  nome: string;
  empresa?: string;
  preco: number;
  quantidade: number;
};

export const gifts = pgTable("gifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomeRemetente: text("nome_remetente").notNull(),
  mensagem: text("mensagem").notNull().default(""),
  itens: jsonb("itens").$type<SubmissionItem[]>().notNull().default([]),
  total: integer("total").notNull().default(0),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export type GiftRow = {
  id: string;
  nomeRemetente: string;
  mensagem: string;
  itens: SubmissionItem[];
  total: number;
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
    itens: r.itens ?? [],
    total: r.total,
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
  itens: SubmissionItem[];
}): Promise<GiftRow> {
  const itens: SubmissionItem[] = input.itens.map((i) => ({
    giftId: String(i.giftId),
    nome: String(i.nome),
    empresa: i.empresa ? String(i.empresa) : undefined,
    preco: Number(i.preco) || 0,
    quantidade: Math.max(1, Math.min(99, Math.round(Number(i.quantidade) || 1))),
  }));
  const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const [row] = await getDb()
    .insert(gifts)
    .values({ nomeRemetente: input.nomeRemetente, mensagem: input.mensagem, itens, total })
    .returning();
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
      const itens = Array.isArray(body.itens) ? body.itens : [];

      if (!nomeRemetente || itens.length === 0) {
        res.status(400).json({ error: "nomeRemetente e ao menos um item são obrigatórios" });
        return;
      }

      res.status(201).json(await createGift({ nomeRemetente, mensagem, itens }));
      return;
    }

    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    console.error("[api/gifts]", err);
    res.status(500).json({ error: "erro no servidor", detail: err instanceof Error ? err.message : String(err) });
  }
}
