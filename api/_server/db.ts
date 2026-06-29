import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Lazy: só conecta quando a query roda (no request), assim um erro de config vira
// resposta tratada em vez de crash no carregamento do módulo (FUNCTION_INVOCATION_FAILED).
// Em produção a Vercel injeta DATABASE_URL; em dev o dotenv é carregado pelo plugin/scripts.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL não configurada no ambiente");
    _db = drizzle({ client: neon(url), schema });
  }
  return _db;
}
