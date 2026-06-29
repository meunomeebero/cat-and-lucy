import type { VercelRequest, VercelResponse } from "@vercel/node";

// Diagnóstico: sem imports pesados. Isola runtime/env do resto.
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    node: process.version,
  });
}
