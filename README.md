# Festa de Aniversário — Catarina & Lúcia 🎂

Site estático e fofo (estilo scrapbook / adesivo, tons pastéis) para o aniversário da
Maria Catarina e da Maria Lúcia. Tem "Save the Date" com flutuação e parallax, uma lista
de presentes, um checkout com Pix e uma mesa de presentes coletiva.

> **Tudo é mockado e 100% client-side.** Não há backend, banco de dados, login nem
> validação de pagamento. É um site para amigos e família.

## Como rodar

```bash
npm install
npm run dev      # abre o Vite (porta 5173 por padrão)
```

Build de produção (gera `dist/` estático, publicável em qualquer lugar):

```bash
npm run build
npm run preview
```

Testes (lógica do Pix e da mesa de presentes):

```bash
npm run test
```

## Estrutura

- `src/sections/` — as 3 seções da home: `SaveTheDate`, `GiftList`, `GiftTable`.
- `src/pages/GiftCheckout.tsx` — rota `/presente/:id` (nome, mensagem, foto, Pix, concluir).
- `src/lib/pix.ts` — gera o Pix "copia e cola" (BR Code EMV + CRC16).
- `src/lib/giftTable.ts` — mesa de presentes via `localStorage` (com presentes de exemplo).
- `src/data/gifts.ts` — lista mockada de presentes e preços.
- `src/components/` — `FloatingAsset`, `Sticker`, `PixBox`, `Avatar`, `GiftModal`.
- `public/assets/` — ilustrações (nuvens, balões, coroas, estrelas, presentes...).

## Assets (ilustrações)

Geradas com o **NanoBanana Pro** (`google/gemini-3-pro-image`) via OpenRouter, sobre um
fundo verde chroma-key que é removido com `sharp` para virar PNG transparente.

```bash
node --env-file=.env --experimental-strip-types scripts/generate-assets.ts          # gera o que faltar
node --env-file=.env --experimental-strip-types scripts/generate-assets.ts --force   # regenera tudo
```

Validação visual do design (opinião do GLM 5 vision):

```bash
node --env-file=.env --experimental-strip-types scripts/design-review.ts <imagem> "contexto"
```

## Pix

O checkout mostra a chave **CPF** do favorecido, o valor (= preço do presente) e o
"copia e cola" + QR Code, todos gerados no navegador. **Não há validação** de pagamento;
o botão "Concluir" só agradece e adiciona o presente na mesa (no `localStorage` do
visitante). A mesa não é compartilhada entre dispositivos.

## Configuração

A chave do OpenRouter fica em `.env` (que **não** é versionado — veja `.gitignore`). Use
`.env.example` como referência. Como a chave já foi compartilhada em texto, recomenda-se
**rotacioná-la** no painel do OpenRouter.

```
OPENROUTER_API_KEY=...
IMAGE_MODEL=google/gemini-3-pro-image
GLM_MODEL=z-ai/glm-5v-turbo
```
