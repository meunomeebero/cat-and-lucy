import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL ausente (configure o .env)");

const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS gifts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_remetente text NOT NULL,
    mensagem text NOT NULL DEFAULT '',
    gift_id text NOT NULL,
    gift_nome text NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS gifts_criado_em_idx ON gifts (criado_em DESC)`;

const rows = await sql`SELECT count(*)::int AS count FROM gifts`;
console.log("tabela 'gifts' pronta. linhas atuais:", rows[0].count);
