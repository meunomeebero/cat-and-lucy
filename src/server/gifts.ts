import { desc } from "drizzle-orm";
import { db } from "./db";
import { gifts } from "./schema";

export type GiftRow = {
  id: string;
  nomeRemetente: string;
  mensagem: string;
  giftId: string;
  giftNome: string;
  criadoEm: number;
};

export type NewGift = {
  nomeRemetente: string;
  mensagem: string;
  giftId: string;
  giftNome: string;
};

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
  const rows = await db.select().from(gifts).orderBy(desc(gifts.criadoEm));
  return rows.map(toRow);
}

export async function createGift(input: NewGift): Promise<GiftRow> {
  const [row] = await db
    .insert(gifts)
    .values({
      nomeRemetente: input.nomeRemetente,
      mensagem: input.mensagem,
      giftId: input.giftId,
      giftNome: input.giftNome,
    })
    .returning();
  return toRow(row);
}
