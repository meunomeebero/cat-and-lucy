import type { VercelRequest, VercelResponse } from "@vercel/node";

// Health check leve.
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ok: true, hasDbUrl: Boolean(process.env.DATABASE_URL) });
}
