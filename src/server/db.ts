import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Em produção (Vercel) as variáveis já vêm injetadas; em dev o dotenv carrega o .env.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL ausente");

const sql = neon(url);
export const db = drizzle({ client: sql, schema });
