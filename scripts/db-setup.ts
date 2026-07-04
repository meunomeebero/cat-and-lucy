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
    itens jsonb NOT NULL DEFAULT '[]',
    total integer NOT NULL DEFAULT 0,
    criado_em timestamptz NOT NULL DEFAULT now()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS gifts_criado_em_idx ON gifts (criado_em DESC)`;

// Ledger de pagamentos (Asaas). Um envio pago por cartão vira uma order pending e só
// materializa uma linha em 'gifts' (a mesa) quando o pagamento é CONFIRMADO.
await sql`
  CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    external_reference text NOT NULL UNIQUE,
    asaas_id text UNIQUE,
    asaas_customer_id text,
    status text NOT NULL DEFAULT 'pending',
    metodo text NOT NULL DEFAULT 'asaas_card',
    valor numeric(10,2) NOT NULL,
    nome_remetente text NOT NULL,
    mensagem text NOT NULL DEFAULT '',
    itens jsonb NOT NULL DEFAULT '[]',
    gift_id uuid,
    criado_em timestamptz NOT NULL DEFAULT now(),
    confirmado_em timestamptz
  )
`;
await sql`CREATE INDEX IF NOT EXISTS orders_ext_ref_idx ON orders (external_reference)`;
await sql`CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status)`;

const rows = await sql`SELECT count(*)::int AS count FROM gifts`;
const ordCount = await sql`SELECT count(*)::int AS count FROM orders`;
console.log("tabela 'gifts':", rows[0].count, "linhas | 'orders':", ordCount[0].count, "linhas");
