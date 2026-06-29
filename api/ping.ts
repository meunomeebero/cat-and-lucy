import type { VercelRequest, VercelResponse } from "@vercel/node";

// Health check + qual commit está vivo (pra diagnóstico de deploy).
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7),
  });
}
