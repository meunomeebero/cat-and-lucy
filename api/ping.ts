import type { VercelRequest, VercelResponse } from "@vercel/node";

// Diagnóstico: testa cada peça dinamicamente p/ isolar o que quebra o /api/gifts.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const out: Record<string, unknown> = {
    ok: true,
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    node: process.version,
  };

  try {
    const { neon } = await import("@neondatabase/serverless");
    out.neonImport = "ok";
    const sql = neon(process.env.DATABASE_URL as string);
    const r = await sql`select 1 as one`;
    out.query = (r as Array<{ one: number }>)[0]?.one;
  } catch (e) {
    out.neonError = e instanceof Error ? e.message : String(e);
  }

  try {
    await import("drizzle-orm/neon-http");
    out.drizzleImport = "ok";
  } catch (e) {
    out.drizzleError = e instanceof Error ? e.message : String(e);
  }

  try {
    const mod = await import("../src/server/gifts");
    out.srcImport = "ok";
    out.gifts = (await mod.listGifts()).length;
  } catch (e) {
    out.srcError = e instanceof Error ? e.message : String(e);
  }

  res.status(200).json(out);
}
