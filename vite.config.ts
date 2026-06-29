/// <reference types="vitest/config" />
import "dotenv/config"; // carrega .env p/ o plugin de API em dev (DATABASE_URL etc.)
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage } from "node:http";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

// Em dev o Vite não roda as funções da Vercel, então servimos /api/gifts aqui
// reaproveitando exatamente a mesma lógica (src/server/gifts) que a função usa.
function apiDevServer(): Plugin {
  return {
    name: "api-dev-server",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/gifts", async (req, res) => {
        res.setHeader("content-type", "application/json");
        try {
          const { listGifts, createGift } = await server.ssrLoadModule("/src/server/gifts.ts");
          if (req.method === "GET") {
            res.end(JSON.stringify(await listGifts()));
            return;
          }
          if (req.method === "POST") {
            const raw = await readBody(req);
            const body = raw ? JSON.parse(raw) : {};
            const nomeRemetente = String(body.nomeRemetente ?? "").trim();
            const mensagem = String(body.mensagem ?? "").trim();
            const giftId = String(body.giftId ?? "");
            const giftNome = String(body.giftNome ?? "");
            if (!nomeRemetente || !giftId) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "nomeRemetente e giftId são obrigatórios" }));
              return;
            }
            res.statusCode = 201;
            res.end(JSON.stringify(await createGift({ nomeRemetente, mensagem, giftId, giftNome })));
            return;
          }
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "method not allowed" }));
        } catch (err) {
          console.error("[api-dev]", err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDevServer()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
