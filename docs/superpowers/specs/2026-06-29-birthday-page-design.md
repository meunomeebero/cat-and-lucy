# Site de Aniversário — Catarina & Lúcia

**Data do spec:** 2026-06-29
**Autor:** Roberto (pai) + Claude
**Status:** Aguardando aprovação

---

## 1. Visão geral

Site de página única (com uma rota extra de "checkout") para o aniversário das duas
filhas, **Maria Catarina** e **Maria Lúcia**. Estilo **scrapbook / adesivo / crayon**,
tons pastéis, com muitos assets recortados flutuando e efeitos de parallax no scroll.

**Princípios:**

- **100% estático**, sem backend, sem banco, sem login, sem validação de pagamento.
- Tudo **mockado**: lista de presentes, preços e mesa de presentes de exemplo.
- O que o visitante "envia" aparece na mesa na hora via `localStorage` (efímero, só
  para dar a sensação — some se limpar o navegador). Sem compartilhamento entre usuários.
- **Pix** gerado client-side (chave CPF + copia-e-cola + QR), sem webhook/validação.

## 2. Stack

- **Vite + React + TypeScript** → build estático (HTML/CSS/JS puro).
- **Motion** (`motion` / framer-motion) para flutuação, parallax, transições e modal.
- **react-router-dom** para a rota de checkout (`/presente/:id`).
- **qrcode** (ou similar) para renderizar o QR do Pix.
- Fontes via **Google Fonts** (grátis).
- Skills de animação: `emil-design-eng` (build) + `review-animations` (review),
  instaladas via `npx skills add emilkowalski/skill`.
- Deploy: build estático — pode rodar local (`vite preview`) ou publicar de graça
  (Vercel/Netlify). Não é obrigatório publicar agora.

## 3. Identidade visual

### Regras de ouro (restrições do cliente)
- ❌ **Sem neon**
- ❌ **Sem `box-shadow`**
- ❌ **Sem bordas destacadas**
- ❌ **Sem degradê**
- Profundidade vem **só** de sobreposição de recortes + leve rotação (adesivo colado torto).

### Paleta pastel
- Rosa-algodão, amarelo-manteiga, bege-creme, lilás suave, verde-menta clarinho.
- Fundo: creme/branco-quente com **textura de papel** sutil (scrapbook).

### Tipografia (candidatas — definidas na validação visual)
- **Título/nomes (script fofo):** Caveat / Grandstander / Gochi Hand.
- **Corpo e botões (arredondada):** Fredoka / Quicksand.

## 4. Assets gerados (NanoBanana Pro via OpenRouter)

Todos **PNG com fundo transparente**, alta qualidade, gerados individualmente para poder
animar cada um. Antes de gerar, confirmar o ID do modelo "Nano Banana Pro" na API do
OpenRouter (provável `google/gemini-3-pro-image-preview`). Chave do OpenRouter fica em
`.env` **fora do git** (`.gitignore`).

Lista de assets:

- Nuvens (3-4 formas diferentes)
- Arco-íris com nuvem (2 variações)
- Coroas douradas (2 — uma "Catarina", uma "Lúcia")
- Balões pastéis (rosa, amarelo, lilás — separados)
- Estrelinhas-diamante / brilhos (2-3 tamanhos)
- Confete / recortes soltos
- Fita "Save the date" (estilo recorte de papel)
- Presentinhos (caixas de presente fofas, 4-6 variações) — para a lista e para a mesa

Fallback: se algum asset sair ruim, regenerar com prompt ajustado; SVGs simples só como
último recurso.

## 5. Seções e fluxo

### Seção 1 — Save the Date
- Fita "Save the date" → **"Catarina & Lúcia"** (com `&`) → **"Festa de aniversário"**.
- Detalhes do evento: **24 de junho · 13h** · **R. Palmares, 196 — Parque Industrial —
  São José dos Campos**.
- Coroas, arco-íris, nuvens, estrelas e balões espalhados (referência: mockup anexado),
  todos com **flutuação** sutil em loop.
- **No scroll:** balões sobem e somem, estrelas se desfazem (fade + scale), nuvens
  deslizam pra fora, e a Seção 2 surge — com **parallax** (camadas em velocidades diferentes).

### Seção 2 — Escolha um presente
- Texto: *"Escolha um presente e mande uma mensagem para a Catarina e a Lúcia."*
- **Grid de presentes mockados** (cards estilo recorte, levemente tortos): ilustração de
  presentinho + nome + preço. Lista inicial (ajustável):
  - Caixa de lápis de cor — R$ 30
  - Livro de histórias — R$ 45
  - Kit de massinha — R$ 50
  - Ursinho de pelúcia — R$ 80
  - Vestido de princesa — R$ 120
  - Bicicleta — R$ 250
- Clicar num presente → navega para `/presente/:id`.

### Rota de checkout — `/presente/:id`
- Mostra o presente escolhido + preço.
- Campos do formulário:
  - **Nome de quem envia** (ex.: "Presente da família XYZ") — obrigatório.
  - **Mensagem** — opcional.
  - **Foto** (opcional) — vira o avatar redondo na mesa (guardada como base64 no
    `localStorage`).
- **Bloco Pix:**
  - Chave **CPF 036.417.452-84** em destaque + botão "copiar".
  - **Valor = preço do presente**.
  - Favorecido: **Roberto Rocha da Costa Junior** (só para conferência).
  - **Pix copia-e-cola** (BR Code EMV) + **QR** gerados no navegador. O campo "cidade" do
    payload EMV é só metadado e não afeta a transferência; usar um valor padrão.
- Botão **"Concluir"** → tela de agradecimento fofa + adiciona o presente na mesa
  (Seção 3) via `localStorage`. Sem validação real de pagamento.

### Seção 3 — Mesa de presentes digital
- Vários **presentinhos flutuando** (exemplos mockados + os "enviados" do `localStorage`),
  cada um com **avatar redondo** em cima (foto enviada ou inicial do nome).
- Clicar abre **modal**: título *"Presente da [nome]"* + mensagem + presente escolhido.
- Sensação de pilha/mesa coletiva que cresce a cada envio.

## 6. Animação & validação de design

- Flutuação, parallax, transições de rota e abertura de modal com **Motion**, refinadas
  pelas skills `emil-design-eng` + `review-animations`.
- **Loop de validação com GLM 5.2** (via OpenRouter): a cada etapa visual, tirar
  screenshot, enviar ao GLM 5.2 para avaliar beleza/fofura/coerência com o estilo
  scrapbook pastel, aplicar ajustes e repetir até ficar redondo.

## 7. Estrutura de arquivos (proposta)

```
/
├─ .env                      # OPENROUTER_API_KEY (fora do git)
├─ index.html
├─ vite.config.ts
├─ scripts/
│  └─ generate-assets.ts     # gera os assets via OpenRouter/NanoBanana Pro
├─ public/
│  └─ assets/                # PNGs gerados (nuvens, balões, coroas, etc.)
└─ src/
   ├─ main.tsx
   ├─ App.tsx                # rotas
   ├─ data/gifts.ts          # lista mockada de presentes
   ├─ lib/pix.ts             # geração do BR Code/copia-e-cola
   ├─ lib/giftTable.ts       # leitura/escrita no localStorage
   ├─ components/            # Cloud, Balloon, Star, Crown, FloatingAsset, Modal...
   ├─ sections/
   │  ├─ SaveTheDate.tsx
   │  ├─ GiftList.tsx
   │  └─ GiftTable.tsx
   └─ pages/
      └─ GiftCheckout.tsx
```

## 8. Fora de escopo (para manter simples)

Sem servidor, sem banco de dados, sem autenticação, sem validação de pagamento, sem
webhook, sem compartilhamento real entre visitantes. Tudo client-side e mockado.

## 9. Pontos em aberto / decisões assumidas

- Lista de presentes/preços: usar a lista da Seção 5 como padrão (ajustável a qualquer momento).
- Fontes definidas na validação visual com o GLM 5.2.
- A chave do OpenRouter foi compartilhada em texto plano no chat; recomenda-se rotacioná-la
  depois. Por ora fica só no `.env` local.
