import type { VercelRequest, VercelResponse } from "@vercel/node";
import { listGifts, createGift } from "../src/server/gifts";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      res.status(200).json(await listGifts());
      return;
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
      const nomeRemetente = String(body.nomeRemetente ?? "").trim();
      const mensagem = String(body.mensagem ?? "").trim();
      const giftId = String(body.giftId ?? "");
      const giftNome = String(body.giftNome ?? "");

      if (!nomeRemetente || !giftId) {
        res.status(400).json({ error: "nomeRemetente e giftId são obrigatórios" });
        return;
      }

      const gift = await createGift({ nomeRemetente, mensagem, giftId, giftNome });
      res.status(201).json(gift);
      return;
    }

    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    console.error("[api/gifts]", err);
    res.status(500).json({ error: "erro no servidor" });
  }
}
