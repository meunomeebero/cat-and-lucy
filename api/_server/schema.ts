import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const gifts = pgTable("gifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomeRemetente: text("nome_remetente").notNull(),
  mensagem: text("mensagem").notNull().default(""),
  giftId: text("gift_id").notNull(),
  giftNome: text("gift_nome").notNull(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});
