# Festa de Aniversário — Catarina & Lucia 🎂

Site fofo (estilo scrapbook / adesivo, tons pastéis) para o aniversário da Maria Catarina
e da Maria Lucia. Tem "Save the Date" com flutuação e parallax, lista de presentes,
checkout com Pix e uma **mesa de presentes coletiva e persistente**.

**Stack:** Vite + React + TypeScript no frontend; funções serverless da Vercel (`/api`)
com **Drizzle ORM** sobre **Postgres (Neon)** para persistir os presentes enviados.
Scroll suave com Lenis, animações com Motion, sons fofos com Web Audio.

🌐 **Produção:** https://cat-and-lucy.vercel.app

## Como rodar

```bash
npm install
npm run dev      # Vite + a API (/api/gifts) servida pelo plugin de dev
npm run build    # build de produção
npm run test     # testes (Pix, client da mesa, fluxo de checkout)
```

Precisa de um `.env` com `DATABASE_URL` (Neon) para a API funcionar localmente —
use `.env.example` como referência. Em produção a Vercel injeta as variáveis.

## Banco de dados (Neon + Drizzle)

A mesa de presentes é **compartilhada entre todos** (não é localStorage). Cada envio vira
uma linha na tabela `gifts`.

```bash
npm run db:setup   # cria a tabela 'gifts' no Neon (idempotente)
npm run db:push    # alternativa via drizzle-kit
```

- `api/gifts.ts` — função serverless: `GET` lista os presentes, `POST` cria um.
  É um arquivo único (schema + db + queries + handler) de propósito: a Vercel só empacota
  imports de `node_modules` na função, então nada de imports de arquivos locais aqui.
- Em dev, o `vite.config.ts` tem um plugin que serve `/api/gifts` reaproveitando as
  funções exportadas desse mesmo arquivo.

## Estrutura

- `src/sections/` — as 3 seções da home: `SaveTheDate`, `GiftList`, `GiftTable`.
- `src/pages/GiftCheckout.tsx` — rota `/presente/:id` (nome, mensagem, Pix, concluir).
- `src/lib/pix.ts` — gera o Pix "copia e cola" (BR Code EMV + CRC16).
- `src/lib/giftTable.ts` — client da mesa (fala com `/api/gifts`).
- `src/lib/sounds.ts` — efeitos sonoros fofos (Web Audio, sem arquivos).
- `src/data/gifts.ts` — catálogo de presentes e preços.
- `src/components/` — `FloatingAsset`, `Sticker`, `PixBox`, `Avatar`, `GiftModal`.
- `api/` — funções serverless. `public/assets/` — ilustrações.

## Assets (ilustrações)

Geradas com o **NanoBanana Pro** (`google/gemini-3-pro-image`) via OpenRouter, sobre um
fundo verde chroma-key removido com `sharp` para virar PNG transparente.

```bash
node --env-file=.env --experimental-strip-types scripts/generate-assets.ts          # gera o que faltar
node --env-file=.env --experimental-strip-types scripts/generate-assets.ts --force   # regenera tudo
```

## Pix

O checkout mostra a chave **CPF** do favorecido, o valor (= preço do presente) e o
"copia e cola" + QR Code, todos gerados no navegador. **Não há validação** de pagamento;
ao "Concluir", o presente é gravado no banco e aparece na mesa pra todo mundo.

## Configuração / segredos

`.env` (não versionado): `DATABASE_URL` (Neon), `OPENROUTER_API_KEY` (só p/ os scripts de
assets/design). Recomenda-se **rotacionar** chaves que já foram compartilhadas em texto.
