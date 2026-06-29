# Site de Aniversário Catarina & Lúcia — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um site estático (Vite + React + TS) de aniversário, estilo scrapbook pastel, com assets gerados no NanoBanana Pro, flutuação + parallax, lista de presentes mockada, checkout com Pix client-side e mesa de presentes coletiva via localStorage.

**Architecture:** SPA estática com 2 rotas (`/` landing de 3 seções + `/presente/:id` checkout). Lógica pura isolada em `src/lib` (Pix BR Code, mesa de presentes) com testes. Assets PNG transparentes gerados por script via OpenRouter. Animação com Motion. Validação visual iterativa com GLM (vision) via OpenRouter.

**Tech Stack:** Vite, React 18, TypeScript, react-router-dom, motion, qrcode.react, @fontsource (Caveat/Fredoka), vitest + jsdom. Scripts Node nativos (fetch) + sharp (opcional, pós-processamento de assets).

## Global Constraints

- **100% estático**, sem backend/banco/login/validação de pagamento/webhook.
- **Estilo:** scrapbook / adesivo / crayon, tons pastéis (rosa-algodão, amarelo-manteiga, bege-creme, lilás, menta), fundo creme com textura de papel.
- **Proibido (regra de ouro):** `box-shadow`, `linear-gradient`/`radial-gradient`/qualquer degradê, cores neon, bordas destacadas. Profundidade só por sobreposição + rotação leve.
- **Nomes de exibição:** "Catarina & Lúcia" (com `&`). Nomes completos: Maria Catarina, Maria Lúcia.
- **Evento:** 24 de junho · 13h · R. Palmares, 196 — Parque Industrial — São José dos Campos.
- **Pix:** chave **CPF `03641745284`** (036.417.452-84), favorecido "Roberto Rocha da Costa Junior" (só exibição/conferência), valor = preço do presente. Sem validação.
- **Segredos:** `OPENROUTER_API_KEY` só em `.env` (no `.gitignore`). Nunca commitar a chave nem assets-prompt com a chave.
- **Assets gerados:** NanoBanana Pro via OpenRouter, PNG fundo transparente.

---

### Task 1: Scaffold do projeto + design tokens + estilos globais

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `.gitignore`, `.env.example`, `.env`
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/vite-env.d.ts`

**Interfaces:**
- Produces: app React montável em `#root`; CSS vars de design (`--rosa`, `--amarelo`, `--bege`, `--lilas`, `--menta`, `--papel`, `--tinta`) e fontes `--font-script`, `--font-corpo`.

- [ ] **Step 1: Inicializar projeto e instalar dependências**

Run:
```bash
cd /Users/robertojunior/conductor/workspaces/birthday-page/jakarta
npm init -y
npm install react react-dom react-router-dom motion qrcode.react
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom vitest jsdom @testing-library/react @testing-library/jest-dom @fontsource/caveat @fontsource/fredoka @fontsource/grandstander sharp
```
Expected: `node_modules/` criado, sem erros de resolução.

- [ ] **Step 2: Criar `.gitignore` e `.env`**

`.gitignore`:
```
node_modules
dist
.env
.context
*.local
```
`.env`:
```
OPENROUTER_API_KEY=sk-or-v1-XXXXXXXXXXXXXXXXXXXX-REDACTED
```
`.env.example`:
```
OPENROUTER_API_KEY=
```

- [ ] **Step 3: Config Vite + TS**

`vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: "./src/test/setup.ts" },
});
```
`tsconfig.json` (essencial):
```json
{
  "compilerOptions": {
    "target": "ES2020", "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext",
    "skipLibCheck": true, "moduleResolution": "bundler",
    "resolveJsonModule": true, "isolatedModules": true, "noEmit": true,
    "jsx": "react-jsx", "strict": true, "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "scripts"]
}
```
Create `src/test/setup.ts`:
```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 4: `index.html` + `main.tsx` + `App.tsx` mínimos**

`index.html`:
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Catarina & Lúcia — Festa de Aniversário</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```
`src/main.tsx`:
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/caveat/400.css";
import "@fontsource/caveat/700.css";
import "@fontsource/fredoka/400.css";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "./styles/tokens.css";
import "./styles/global.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```
`src/App.tsx` (placeholder até Task 11):
```tsx
export default function App() {
  return <h1 style={{ fontFamily: "var(--font-script)" }}>Catarina &amp; Lúcia</h1>;
}
```

- [ ] **Step 5: Design tokens + global (regras de ouro)**

`src/styles/tokens.css`:
```css
:root {
  --rosa: #f7c9d6;        --rosa-forte: #e89ab0;
  --amarelo: #fce8a6;     --amarelo-forte: #f6d365;
  --bege: #f3e7d3;        --creme: #fbf6ec;
  --lilas: #d8c8ef;       --menta: #cfe9d4;
  --papel: #fbf6ec;       --tinta: #6b5847;   --tinta-rosa: #c96a86;
  --font-script: "Caveat", cursive;
  --font-corpo: "Fredoka", system-ui, sans-serif;
}
```
`src/styles/global.css`:
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-corpo);
  color: var(--tinta);
  background-color: var(--papel);
  /* textura de papel sutil sem degradê: ruído leve via SVG inline opcional na Task 7 */
  -webkit-font-smoothing: antialiased;
}
/* REGRA DE OURO: proibido sombra/degradê/neon/borda destacada.
   Nenhum box-shadow, nenhum *-gradient, nenhuma border chamativa neste projeto. */
img { display: block; -webkit-user-drag: none; user-select: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; }
```

- [ ] **Step 6: Rodar dev server e validar**

Run: `npm run dev` (adicionar scripts antes — ver abaixo) e abrir.
Adicionar em `package.json` `"scripts"`:
```json
{ "dev": "vite", "build": "tsc -b && vite build", "preview": "vite preview", "test": "vitest run", "assets": "node --experimental-strip-types scripts/generate-assets.ts" }
```
Run: `npm run build`
Expected: build conclui sem erro, gera `dist/`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite+React+TS, design tokens e regras globais de estilo"
```

---

### Task 2: Lib de Pix (BR Code EMV + CRC16) — TDD

**Files:**
- Create: `src/lib/pix.ts`
- Test: `src/lib/pix.test.ts`

**Interfaces:**
- Produces:
  - `crc16(payload: string): string` — CRC16-CCITT (poly 0x1021, init 0xFFFF), hex maiúsculo 4 dígitos.
  - `buildPixPayload(args: { key: string; amount: number; merchantName: string; merchantCity: string; txid?: string }): string` — string "copia e cola" do Pix estático.

- [ ] **Step 1: Escrever os testes que falham**

`src/lib/pix.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { crc16, buildPixPayload } from "./pix";

describe("crc16", () => {
  it("bate o vetor canônico CRC16-CCITT-FALSE de '123456789' = 0x29B1", () => {
    expect(crc16("123456789")).toBe("29B1");
  });
});

describe("buildPixPayload", () => {
  const payload = buildPixPayload({
    key: "03641745284", amount: 30, merchantName: "Roberto Rocha da Costa Junior",
    merchantCity: "SAO JOSE CAMPOS", txid: "PRESENTE01",
  });
  it("começa com Payload Format Indicator", () => {
    expect(payload.startsWith("000201")).toBe(true);
  });
  it("inclui o GUI do pix e a chave", () => {
    expect(payload).toContain("br.gov.bcb.pix");
    expect(payload).toContain("03641745284");
  });
  it("inclui valor formatado com 2 casas", () => {
    expect(payload).toContain("5406" + "30.00");
  });
  it("termina com CRC válido (recalcular o que precede '6304' bate)", () => {
    const semCrc = payload.slice(0, -4);
    expect(semCrc.endsWith("6304")).toBe(true);
    expect(crc16(semCrc)).toBe(payload.slice(-4));
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/pix.test.ts`
Expected: FAIL ("crc16 is not a function" / módulo não existe).

- [ ] **Step 3: Implementar `src/lib/pix.ts`**

```ts
export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function sanitize(text: string, max: number): string {
  return text
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max)
    .trim();
}

export function buildPixPayload(args: {
  key: string; amount: number; merchantName: string; merchantCity: string; txid?: string;
}): string {
  const { key, amount, merchantName, merchantCity, txid = "***" } = args;
  const gui = field("00", "br.gov.bcb.pix");
  const chave = field("01", key);
  const merchantAccount = field("26", gui + chave);
  const additional = field("62", field("05", sanitize(txid, 25) || "***"));

  const payload =
    field("00", "01") +
    merchantAccount +
    field("52", "0000") +
    field("53", "986") +
    field("54", amount.toFixed(2)) +
    field("58", "BR") +
    field("59", sanitize(merchantName, 25)) +
    field("60", sanitize(merchantCity, 15)) +
    additional +
    "6304";

  return payload + crc16(payload);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/pix.test.ts`
Expected: PASS (todos os testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/pix.ts src/lib/pix.test.ts
git commit -m "feat: lib de Pix (BR Code EMV + CRC16) com testes"
```

---

### Task 3: Dados mockados dos presentes

**Files:**
- Create: `src/data/gifts.ts`
- Test: `src/data/gifts.test.ts`

**Interfaces:**
- Produces:
  - `type Gift = { id: string; nome: string; preco: number; asset: string }`
  - `GIFTS: Gift[]` (lista da Seção 2 do spec).
  - `getGiftById(id: string): Gift | undefined`

- [ ] **Step 1: Teste que falha**

`src/data/gifts.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { GIFTS, getGiftById } from "./gifts";

describe("GIFTS", () => {
  it("tem ao menos 6 presentes, todos com id/nome/preco/asset", () => {
    expect(GIFTS.length).toBeGreaterThanOrEqual(6);
    for (const g of GIFTS) {
      expect(g.id).toBeTruthy();
      expect(g.nome).toBeTruthy();
      expect(g.preco).toBeGreaterThan(0);
      expect(g.asset).toMatch(/\/assets\//);
    }
  });
  it("ids são únicos", () => {
    expect(new Set(GIFTS.map((g) => g.id)).size).toBe(GIFTS.length);
  });
  it("getGiftById acha e retorna undefined pra inexistente", () => {
    expect(getGiftById(GIFTS[0].id)?.id).toBe(GIFTS[0].id);
    expect(getGiftById("nao-existe")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/data/gifts.test.ts`
Expected: FAIL (módulo inexistente).

- [ ] **Step 3: Implementar `src/data/gifts.ts`**

```ts
export type Gift = { id: string; nome: string; preco: number; asset: string };

export const GIFTS: Gift[] = [
  { id: "lapis-de-cor", nome: "Caixa de lápis de cor", preco: 30, asset: "/assets/presente-1.png" },
  { id: "livro-historias", nome: "Livro de histórias", preco: 45, asset: "/assets/presente-2.png" },
  { id: "kit-massinha", nome: "Kit de massinha", preco: 50, asset: "/assets/presente-3.png" },
  { id: "ursinho", nome: "Ursinho de pelúcia", preco: 80, asset: "/assets/presente-4.png" },
  { id: "vestido-princesa", nome: "Vestido de princesa", preco: 120, asset: "/assets/presente-5.png" },
  { id: "bicicleta", nome: "Bicicleta", preco: 250, asset: "/assets/presente-6.png" },
];

export function getGiftById(id: string): Gift | undefined {
  return GIFTS.find((g) => g.id === id);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/data/gifts.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/gifts.ts src/data/gifts.test.ts
git commit -m "feat: dados mockados dos presentes"
```

---

### Task 4: Mesa de presentes via localStorage — TDD

**Files:**
- Create: `src/lib/giftTable.ts`
- Test: `src/lib/giftTable.test.ts`

**Interfaces:**
- Produces:
  - `type SentGift = { id: string; nomeRemetente: string; mensagem: string; foto?: string; giftId: string; giftNome: string; criadoEm: number }`
  - `getSentGifts(): SentGift[]` — retorna seeds mockadas + as salvas, mais recentes primeiro.
  - `addSentGift(input: Omit<SentGift, "id" | "criadoEm">): SentGift` — salva no localStorage e retorna o registro criado (id gerado via timestamp+contador, sem Math.random).
  - `SEED_GIFTS: SentGift[]` — presentes de exemplo.

- [ ] **Step 1: Teste que falha**

`src/lib/giftTable.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { getSentGifts, addSentGift, SEED_GIFTS } from "./giftTable";

beforeEach(() => localStorage.clear());

describe("giftTable", () => {
  it("sem nada salvo, retorna só as seeds", () => {
    expect(getSentGifts().length).toBe(SEED_GIFTS.length);
  });
  it("addSentGift adiciona e aparece no topo", () => {
    const novo = addSentGift({
      nomeRemetente: "Família Souza", mensagem: "Parabéns!",
      giftId: "ursinho", giftNome: "Ursinho de pelúcia",
    });
    const lista = getSentGifts();
    expect(lista.length).toBe(SEED_GIFTS.length + 1);
    expect(lista[0].id).toBe(novo.id);
    expect(lista[0].nomeRemetente).toBe("Família Souza");
  });
  it("persiste entre chamadas (mesmo localStorage)", () => {
    addSentGift({ nomeRemetente: "A", mensagem: "", giftId: "x", giftNome: "X" });
    addSentGift({ nomeRemetente: "B", mensagem: "", giftId: "y", giftNome: "Y" });
    expect(getSentGifts().length).toBe(SEED_GIFTS.length + 2);
  });
  it("gera ids únicos mesmo em chamadas rápidas", () => {
    const a = addSentGift({ nomeRemetente: "A", mensagem: "", giftId: "x", giftNome: "X" });
    const b = addSentGift({ nomeRemetente: "B", mensagem: "", giftId: "y", giftNome: "Y" });
    expect(a.id).not.toBe(b.id);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/giftTable.test.ts`
Expected: FAIL (módulo inexistente).

- [ ] **Step 3: Implementar `src/lib/giftTable.ts`**

```ts
export type SentGift = {
  id: string;
  nomeRemetente: string;
  mensagem: string;
  foto?: string;
  giftId: string;
  giftNome: string;
  criadoEm: number;
};

const KEY = "mesa-de-presentes-v1";

export const SEED_GIFTS: SentGift[] = [
  { id: "seed-1", nomeRemetente: "Família Oliveira", mensagem: "Parabéns, meninas! Muita saúde e alegria.", giftId: "ursinho", giftNome: "Ursinho de pelúcia", criadoEm: 1 },
  { id: "seed-2", nomeRemetente: "Tia Bia", mensagem: "Que esse dia seja mágico! Beijos.", giftId: "vestido-princesa", giftNome: "Vestido de princesa", criadoEm: 2 },
  { id: "seed-3", nomeRemetente: "Pedro e Ana", mensagem: "Feliz aniversário! Com carinho.", giftId: "livro-historias", giftNome: "Livro de histórias", criadoEm: 3 },
];

let counter = 0;
function genId(): string {
  counter += 1;
  return `g-${Date.now()}-${counter}`;
}

function readStored(): SentGift[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SentGift[]) : [];
  } catch {
    return [];
  }
}

export function getSentGifts(): SentGift[] {
  const stored = readStored();
  return [...stored, ...SEED_GIFTS].sort((a, b) => b.criadoEm - a.criadoEm);
}

export function addSentGift(input: Omit<SentGift, "id" | "criadoEm">): SentGift {
  const novo: SentGift = { ...input, id: genId(), criadoEm: Date.now() };
  const stored = readStored();
  localStorage.setItem(KEY, JSON.stringify([novo, ...stored]));
  return novo;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/giftTable.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/giftTable.ts src/lib/giftTable.test.ts
git commit -m "feat: mesa de presentes via localStorage com testes"
```

---

### Task 5: Tooling OpenRouter — geração de assets (NanoBanana Pro) + revisão visual (GLM)

**Files:**
- Create: `scripts/openrouter.ts` (cliente compartilhado)
- Create: `scripts/generate-assets.ts`
- Create: `scripts/asset-prompts.ts`
- Create: `scripts/design-review.ts`
- Create: `public/assets/.gitkeep`

**Interfaces:**
- Produces (em `scripts/openrouter.ts`):
  - `generateImage(prompt: string, opts?: { model?: string }): Promise<Buffer>` — chama OpenRouter chat/completions com `modalities:["image","text"]`, extrai o data URL de `choices[0].message.images[0].image_url.url`, decodifica base64 → PNG Buffer.
  - `reviewDesign(imagePath: string, instrucoes: string, opts?: { model?: string }): Promise<string>` — manda imagem (base64 data URL) + prompt textual a um modelo GLM com visão; retorna a crítica.
  - `listModels(filter: string): Promise<string[]>` — GET `/models`, filtra ids por substring (pra confirmar IDs reais).

- [ ] **Step 1: Confirmar IDs dos modelos antes de codar prompts**

Run (com a chave do `.env`):
```bash
node --env-file=.env -e "fetch('https://openrouter.ai/api/v1/models',{headers:{Authorization:'Bearer '+process.env.OPENROUTER_API_KEY}}).then(r=>r.json()).then(d=>console.log(d.data.filter(m=>/image|glm|banana|gemini-3/i.test(m.id)).map(m=>m.id).join('\n')))"
```
Expected: lista de ids. Anotar o id do **NanoBanana Pro** (ex.: `google/gemini-3-pro-image-preview`) e do **GLM com visão** (ex.: `z-ai/glm-4.6` / `z-ai/glm-4.5v` / `z-ai/glm-5.2` se existir). Usar esses ids como default nos scripts. Se o nome exato do usuário ("glm 5.2") não existir, usar o GLM de visão mais recente disponível e registrar no commit.

- [ ] **Step 2: Cliente `scripts/openrouter.ts`**

```ts
import { readFile } from "node:fs/promises";

const API = "https://openrouter.ai/api/v1";
const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) throw new Error("OPENROUTER_API_KEY ausente (use node --env-file=.env)");

const IMAGE_MODEL = process.env.IMAGE_MODEL ?? "google/gemini-3-pro-image-preview";
const GLM_MODEL = process.env.GLM_MODEL ?? "z-ai/glm-4.6";

async function chat(body: unknown) {
  const res = await fetch(`${API}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function listModels(filter: string): Promise<string[]> {
  const res = await fetch(`${API}/models`, { headers: { Authorization: `Bearer ${KEY}` } });
  const data = await res.json();
  return data.data.map((m: any) => m.id).filter((id: string) => id.includes(filter));
}

export async function generateImage(prompt: string, opts: { model?: string } = {}): Promise<Buffer> {
  const data = await chat({
    model: opts.model ?? IMAGE_MODEL,
    modalities: ["image", "text"],
    messages: [{ role: "user", content: prompt }],
  });
  const url: string | undefined = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("Sem imagem na resposta: " + JSON.stringify(data).slice(0, 500));
  const base64 = url.split(",")[1] ?? url;
  return Buffer.from(base64, "base64");
}

export async function reviewDesign(imagePath: string, instrucoes: string, opts: { model?: string } = {}): Promise<string> {
  const img = await readFile(imagePath);
  const dataUrl = `data:image/png;base64,${img.toString("base64")}`;
  const data = await chat({
    model: opts.model ?? GLM_MODEL,
    messages: [{
      role: "user",
      content: [
        { type: "text", text: instrucoes },
        { type: "image_url", image_url: { url: dataUrl } },
      ],
    }],
  });
  return data?.choices?.[0]?.message?.content ?? "";
}
```

- [ ] **Step 3: Prompts dos assets `scripts/asset-prompts.ts`**

```ts
// Estilo comum a todos: adesivo recortado / scrapbook, pastel, sem sombra, sem degradê chapado, fundo transparente.
const BASE =
  "children's storybook sticker, hand-drawn crayon/gouache texture, soft pastel colors " +
  "(cotton-candy pink, butter yellow, soft lilac, mint), flat cute kawaii illustration, " +
  "die-cut sticker with subtle paper edge, NO drop shadow, NO neon, NO gradient mesh, " +
  "isolated on a fully TRANSPARENT background (PNG alpha). Centered. High detail, crisp edges.";

export const ASSET_PROMPTS: { file: string; prompt: string }[] = [
  { file: "nuvem-1.png", prompt: `A fluffy rounded cloud. ${BASE}` },
  { file: "nuvem-2.png", prompt: `A small fluffy cloud, slightly different shape. ${BASE}` },
  { file: "nuvem-3.png", prompt: `A wide soft cloud. ${BASE}` },
  { file: "arco-iris-1.png", prompt: `A cute pastel rainbow ending in a small fluffy cloud. ${BASE}` },
  { file: "arco-iris-2.png", prompt: `A small pastel rainbow arc with a tiny cloud. ${BASE}` },
  { file: "coroa-1.png", prompt: `A small golden princess crown with a pink gem, cute. ${BASE}` },
  { file: "coroa-2.png", prompt: `A small golden tiara with a lilac gem, cute. ${BASE}` },
  { file: "balao-rosa.png", prompt: `A single pink party balloon with a thin string. ${BASE}` },
  { file: "balao-amarelo.png", prompt: `A single butter-yellow party balloon with a thin string. ${BASE}` },
  { file: "balao-lilas.png", prompt: `A single soft-lilac party balloon with a thin string. ${BASE}` },
  { file: "estrela-1.png", prompt: `A cute pink four-point sparkle/diamond star. ${BASE}` },
  { file: "estrela-2.png", prompt: `A small lilac sparkle star. ${BASE}` },
  { file: "brilho-1.png", prompt: `A tiny twinkle sparkle, pale yellow. ${BASE}` },
  { file: "confete-1.png", prompt: `A few scattered paper confetti pieces, pastel. ${BASE}` },
  { file: "fita-save-the-date.png", prompt: `A cut-paper ribbon banner with the text "Save the date" in cute serif, lilac ribbon. ${BASE}` },
  { file: "presente-1.png", prompt: `A cute wrapped gift box, pink paper with a bow. ${BASE}` },
  { file: "presente-2.png", prompt: `A cute wrapped gift box, yellow paper with a bow. ${BASE}` },
  { file: "presente-3.png", prompt: `A cute wrapped gift box, lilac paper with a bow. ${BASE}` },
  { file: "presente-4.png", prompt: `A cute wrapped gift box, mint paper with a bow. ${BASE}` },
  { file: "presente-5.png", prompt: `A cute tall wrapped gift box, pink and yellow stripes. ${BASE}` },
  { file: "presente-6.png", prompt: `A cute round gift with a big bow, beige paper. ${BASE}` },
  { file: "papel-textura.png", prompt: `A seamless very subtle cream paper texture, almost flat, faint fibers, no pattern, no shadow.` },
];
```

- [ ] **Step 4: Script de geração `scripts/generate-assets.ts`**

```ts
import { mkdir, writeFile, access } from "node:fs/promises";
import { generateImage } from "./openrouter.ts";
import { ASSET_PROMPTS } from "./asset-prompts.ts";

const OUT = "public/assets";
const force = process.argv.includes("--force");

async function exists(p: string) { try { await access(p); return true; } catch { return false; } }

await mkdir(OUT, { recursive: true });
for (const { file, prompt } of ASSET_PROMPTS) {
  const path = `${OUT}/${file}`;
  if (!force && (await exists(path))) { console.log("skip", file); continue; }
  try {
    console.log("gerando", file, "...");
    const buf = await generateImage(prompt);
    await writeFile(path, buf);
    console.log("  ok", file, buf.length, "bytes");
  } catch (e) {
    console.error("  FALHOU", file, (e as Error).message);
  }
}
```

- [ ] **Step 5: Rodar geração e inspecionar visualmente**

Run: `node --env-file=.env scripts/generate-assets.ts`
Expected: PNGs em `public/assets/`. Abrir alguns e conferir: fundo transparente, estilo adesivo, sem sombra/degradê/neon.
- Se o fundo **não** vier transparente (Gemini às vezes ignora), ajustar o prompt para "isolated on a flat solid #00FF00 chroma background" e adicionar pós-processamento com `sharp` removendo a cor-chave (passo extra documentado no commit). Regenerar com `--force`.
- Se algum asset sair feio, ajustar prompt individual e regenerar.

- [ ] **Step 6: Script de revisão visual `scripts/design-review.ts`**

```ts
import { reviewDesign } from "./openrouter.ts";

const imagePath = process.argv[2];
if (!imagePath) throw new Error("uso: design-review.ts <caminho-da-imagem> [contexto]");
const contexto = process.argv[3] ?? "";

const INSTRUCOES =
  "Você é um diretor de arte avaliando um site de aniversário INFANTIL, estilo scrapbook/adesivo, " +
  "tons pastéis (rosa, amarelo, bege, lilás, menta), fofo e lúdico. " +
  "REGRAS DURAS: não pode ter neon, box-shadow, degradê, nem bordas destacadas. " +
  "Avalie a imagem (screenshot da tela) e responda em PT-BR com: (1) nota de 0 a 10 pra 'fofura/coerência'; " +
  "(2) o que está bom; (3) lista objetiva de ajustes pra ficar mais bonito e infantil; " +
  "(4) qualquer violação das regras duras. Seja específico e prático. " + contexto;

const critica = await reviewDesign(imagePath, INSTRUCOES);
console.log(critica);
```
Run (teste de fumaça depois do primeiro screenshot existir): `node --env-file=.env scripts/design-review.ts public/assets/coroa-1.png "Avalie só este asset isolado."`
Expected: crítica textual em PT-BR.

- [ ] **Step 7: Commit (assets + scripts; sem a chave)**

```bash
git add scripts public/assets src
git commit -m "feat: tooling OpenRouter (NanoBanana Pro p/ assets, GLM p/ review) + assets gerados"
```
Conferir `git status` que `.env` NÃO entrou.

---

### Task 6: Componentes de asset flutuante reutilizáveis

**Files:**
- Create: `src/components/FloatingAsset.tsx`
- Create: `src/components/Sticker.tsx`
- Create: `src/components/index.ts`

**Interfaces:**
- Consumes: `motion` (framer-motion).
- Produces:
  - `Sticker` — `<img>` recorte com rotação leve. Props: `{ src: string; alt?: string; width: number; rotate?: number; className?: string; style?: CSSProperties }`. Sem sombra/borda.
  - `FloatingAsset` — envolve `Sticker` com flutuação infinita (Motion). Props: estende as do Sticker + `{ floatRange?: number; duration?: number; delay?: number }`. Anima `y` (±floatRange) e leve `rotate`, loop `reverse`, `ease: "easeInOut"`.

- [ ] **Step 1: `Sticker.tsx`**

```tsx
import type { CSSProperties } from "react";

export type StickerProps = {
  src: string; alt?: string; width: number; rotate?: number;
  className?: string; style?: CSSProperties;
};

export function Sticker({ src, alt = "", width, rotate = 0, className, style }: StickerProps) {
  return (
    <img
      src={src} alt={alt} className={className} draggable={false}
      style={{ width, height: "auto", transform: `rotate(${rotate}deg)`, ...style }}
    />
  );
}
```

- [ ] **Step 2: `FloatingAsset.tsx`**

```tsx
import { motion } from "motion/react";
import type { StickerProps } from "./Sticker";

export type FloatingAssetProps = StickerProps & {
  floatRange?: number; duration?: number; delay?: number;
};

export function FloatingAsset({
  src, alt = "", width, rotate = 0, floatRange = 12, duration = 4, delay = 0, className, style,
}: FloatingAssetProps) {
  return (
    <motion.img
      src={src} alt={alt} className={className} draggable={false}
      style={{ width, height: "auto", ...style }}
      initial={{ y: 0, rotate }}
      animate={{ y: [0, -floatRange, 0], rotate: [rotate, rotate + 2, rotate] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
```

- [ ] **Step 3: Barrel `src/components/index.ts`**

```ts
export { Sticker } from "./Sticker";
export type { StickerProps } from "./Sticker";
export { FloatingAsset } from "./FloatingAsset";
export type { FloatingAssetProps } from "./FloatingAsset";
```

- [ ] **Step 4: Smoke test de render**

Create `src/components/FloatingAsset.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { FloatingAsset } from "./FloatingAsset";
it("renderiza a imagem do asset", () => {
  const { getByRole } = render(<FloatingAsset src="/assets/nuvem-1.png" alt="nuvem" width={100} />);
  expect(getByRole("img")).toHaveAttribute("src", "/assets/nuvem-1.png");
});
```
Run: `npx vitest run src/components/FloatingAsset.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components
git commit -m "feat: componentes Sticker e FloatingAsset (flutuação com Motion)"
```

---

### Task 7: Seção 1 — Save the Date (layout + parallax/scroll)

**Files:**
- Create: `src/sections/SaveTheDate.tsx`
- Create: `src/sections/SaveTheDate.module.css`

**Interfaces:**
- Consumes: `FloatingAsset`, `Sticker`, assets de `public/assets`, `motion` (`useScroll`, `useTransform`).
- Produces: `<SaveTheDate />` — primeira tela cheia (`100vh`).

**Comportamento (critérios de aceite):**
- Conteúdo central: fita "Save the date" (asset), **"Catarina & Lúcia"** em `--font-script` grande, **"Festa de aniversário"** abaixo, e a linha de evento "24 de junho · 13h · R. Palmares, 196 — Parque Industrial — São José dos Campos".
- Coroas, arco-íris, nuvens, estrelas e balões espalhados como o mockup, flutuando.
- **No scroll** (via `useScroll`/`useTransform` no progresso da seção): balões sobem e o opacity vai a 0; estrelas reduzem (scale→0) e somem; nuvens deslizam para fora (x ±); camadas em velocidades diferentes (parallax). A seção 2 aparece embaixo.
- **Sem** sombra/degradê/neon/borda.

- [ ] **Step 1: Maquete estática (sem scroll ainda)**

Implementar `SaveTheDate.tsx` posicionando os assets com `position: absolute` dentro de um container `position: relative; min-height: 100vh; overflow: hidden`. Usar `FloatingAsset` para cada elemento. Texto central num bloco centralizado. CSS no module (sem as propriedades proibidas).

- [ ] **Step 2: Build + render + screenshot**

Plugar `<SaveTheDate />` temporariamente no `App.tsx`. Run: `npm run dev`. Tirar screenshot com a skill `browse` (viewport desktop e mobile).

- [ ] **Step 3: Revisão com GLM 5.2**

Run: `node --env-file=.env scripts/design-review.ts <screenshot> "Seção Save the Date. Avalie disposição, fofura, fidelidade ao mockup pastel/scrapbook."`
Aplicar ajustes apontados (posição, tamanho, paleta) e repetir até nota alta e zero violação das regras duras.

- [ ] **Step 4: Efeitos de scroll/parallax**

Adicionar `const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })` e mapear:
- balões: `y = useTransform(scrollYProgress, [0,1], [0, -400])`, `opacity = useTransform(scrollYProgress,[0,0.6],[1,0])`.
- estrelas: `scale = useTransform(scrollYProgress,[0,0.5],[1,0])`, `opacity` idem.
- nuvens: `x = useTransform(scrollYProgress,[0,1],[0, ±300])`.
Aplicar via `motion.div`/`motion.img` `style`. Manter a flutuação base junto.

- [ ] **Step 5: Revisão de animação + GLM**

Usar skill `review-animations` (timing/curvas) e tirar screenshot a meio-scroll para o GLM avaliar a transição. Ajustar.

- [ ] **Step 6: Commit**

```bash
git add src/sections/SaveTheDate.tsx src/sections/SaveTheDate.module.css
git commit -m "feat: seção Save the Date com flutuação e parallax no scroll"
```

---

### Task 8: Seção 2 — Lista de presentes

**Files:**
- Create: `src/sections/GiftList.tsx`
- Create: `src/sections/GiftList.module.css`

**Interfaces:**
- Consumes: `GIFTS` (`src/data/gifts.ts`), `Sticker`, `useNavigate` (react-router).
- Produces: `<GiftList />`.

**Comportamento (critérios de aceite):**
- Título: "Escolha um presente e mande uma mensagem para a Catarina e a Lúcia." em `--font-script`/`--font-corpo`.
- Grid responsivo de cards estilo recorte (leve rotação alternada), cada card com `Sticker` do presente + nome + preço formatado `R$ XX`.
- Card é clicável (role button / `<button>`): `navigate('/presente/' + gift.id)`.
- Hover: leve `scale`/`rotate` via Motion (sem sombra). Alguns assets pequenos (estrelas/nuvens) flutuando ao fundo, discretos.
- **Sem** sombra/degradê/neon/borda destacada.

- [ ] **Step 1: Implementar grid + cards**

Mapear `GIFTS` em cards. Formatar preço: `gift.preco.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})`. Cada card é `<button onClick={() => navigate(\`/presente/${gift.id}\`)}>`.

- [ ] **Step 2: Build + screenshot + GLM review**

`npm run dev`, screenshot (desktop+mobile), `scripts/design-review.ts`. Ajustar até aprovado.

- [ ] **Step 3: Commit**

```bash
git add src/sections/GiftList.tsx src/sections/GiftList.module.css
git commit -m "feat: seção lista de presentes (cards recorte clicáveis)"
```

---

### Task 9: Página de checkout do presente — `/presente/:id`

**Files:**
- Create: `src/pages/GiftCheckout.tsx`
- Create: `src/pages/GiftCheckout.module.css`
- Create: `src/components/PixBox.tsx`

**Interfaces:**
- Consumes: `getGiftById`, `buildPixPayload`, `addSentGift`, `QRCodeSVG` de `qrcode.react`, `useParams`/`useNavigate`.
- Produces:
  - `PixBox` — props `{ payload: string; chave: string; valor: number; favorecido: string }`. Mostra QR (SVG), a chave CPF com botão "copiar", o copia-e-cola com botão "copiar", valor e favorecido. Sem sombra/borda.
  - `GiftCheckout` página.

**Comportamento (critérios de aceite):**
- Lê `:id`; se inválido, mostra mensagem fofa + link de volta.
- Mostra o presente escolhido (asset + nome + preço).
- Formulário: nome do remetente (obrigatório), mensagem (opcional, textarea), foto (opcional `<input type=file accept="image/*">` → lê como base64 com `FileReader`, preview redondo).
- `PixBox` com `buildPixPayload({ key:"03641745284", amount: gift.preco, merchantName:"Roberto Rocha da Costa Junior", merchantCity:"SAO JOSE CAMPOS", txid: gift.id })`.
- Botão **"Concluir"**: valida nome preenchido; chama `addSentGift({...})` com foto base64; mostra tela de agradecimento fofa com botão "Voltar pra festa" (`navigate('/')`).
- Layout vertical, scrapbook, assets pequenos flutuando ao fundo. **Sem** regras proibidas.

- [ ] **Step 1: `PixBox.tsx`**

Implementar com `QRCodeSVG value={payload} size={180} bgColor="transparent" fgColor="#6b5847"`. Botões copiar usam `navigator.clipboard.writeText`. Mostrar `036.417.452-84`, `valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})`, favorecido.

- [ ] **Step 2: `GiftCheckout.tsx` — presente + formulário**

Estado controlado (`useState`) para nome/mensagem/foto. `FileReader.readAsDataURL` para foto → preview redondo (avatar). Render do presente via `getGiftById`.

- [ ] **Step 3: Fluxo Concluir + agradecimento**

`onConcluir`: se `!nome.trim()` → realçar campo (texto de aviso, sem cor neon). Senão `addSentGift(...)` e setar estado `enviado=true` → render do card de agradecimento "Presente enviado! Obrigado 💛" + botão voltar.

- [ ] **Step 4: Build + screenshot (form e tela de agradecimento) + GLM review**

`npm run dev`, navegar a `/presente/ursinho`, screenshots, `design-review.ts`. Ajustar.

- [ ] **Step 5: Teste de smoke do PixBox**

Create `src/components/PixBox.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { PixBox } from "./PixBox";
it("mostra chave, valor e favorecido", () => {
  const { getByText } = render(
    <PixBox payload="000201..." chave="036.417.452-84" valor={80} favorecido="Roberto Rocha da Costa Junior" />
  );
  expect(getByText(/036\.417\.452-84/)).toBeInTheDocument();
  expect(getByText(/Roberto Rocha da Costa Junior/)).toBeInTheDocument();
});
```
Run: `npx vitest run src/components/PixBox.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/GiftCheckout.tsx src/pages/GiftCheckout.module.css src/components/PixBox.tsx src/components/PixBox.test.tsx
git commit -m "feat: checkout do presente com Pix (QR + copia-e-cola) e fluxo concluir"
```

---

### Task 10: Seção 3 — Mesa de presentes (flutuante + modal)

**Files:**
- Create: `src/sections/GiftTable.tsx`
- Create: `src/sections/GiftTable.module.css`
- Create: `src/components/GiftModal.tsx`
- Create: `src/components/Avatar.tsx`

**Interfaces:**
- Consumes: `getSentGifts`, `SentGift`, `FloatingAsset`/`Sticker`, `motion` (`AnimatePresence`).
- Produces:
  - `Avatar` — props `{ foto?: string; nome: string; size?: number }` → img redonda ou círculo com a inicial. Sem sombra/borda.
  - `GiftModal` — props `{ gift: SentGift | null; onClose: () => void }`. `AnimatePresence` com fade+scale. Título "Presente da [nome]" + mensagem + nome do presente.
  - `<GiftTable />`.

**Comportamento (critérios de aceite):**
- Título "Mesa de presentes". Lê `getSentGifts()` no mount (`useState`/`useEffect`) — inclui seeds + enviados via localStorage.
- Cada presente é um `Sticker` de caixa flutuando (posições/rotações variadas, distribuídas) com `Avatar` redondo sobreposto no topo.
- Clicar num presente abre `GiftModal` com os dados. Fechar por botão e por clique no fundo.
- **Sem** regras proibidas (modal sem box-shadow; separar do fundo por recorte/cor, não por sombra).

- [ ] **Step 1: `Avatar.tsx` + `GiftModal.tsx`**

Implementar Avatar (img `border-radius:50%; object-fit:cover` ou círculo de cor com inicial em `--font-script`). Modal com `AnimatePresence` + overlay translúcido (cor sólida com alpha, sem blur/sombra).

- [ ] **Step 2: `GiftTable.tsx` — distribuição flutuante**

Distribuir presentes em posições pseudo-determinísticas (derivar de `index`, sem `Math.random`) para não "pular" a cada render. `FloatingAsset` com `delay` por index. Avatar sobreposto.

- [ ] **Step 3: Build + screenshot + abrir modal + GLM review**

`npm run dev`, screenshot da mesa e do modal aberto, `design-review.ts`. Ajustar.

- [ ] **Step 4: Teste de smoke do modal**

Create `src/components/GiftModal.test.tsx`:
```tsx
import { render } from "@testing-library/react";
import { GiftModal } from "./GiftModal";
it("mostra título com o nome do remetente", () => {
  const { getByText } = render(
    <GiftModal gift={{ id:"1", nomeRemetente:"Tia Bia", mensagem:"Oi", giftId:"x", giftNome:"Ursinho", criadoEm:1 }} onClose={() => {}} />
  );
  expect(getByText(/Presente da Tia Bia/)).toBeInTheDocument();
});
```
Run: `npx vitest run src/components/GiftModal.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/sections/GiftTable.tsx src/sections/GiftTable.module.css src/components/GiftModal.tsx src/components/GiftModal.test.tsx src/components/Avatar.tsx
git commit -m "feat: mesa de presentes flutuante com avatar e modal"
```

---

### Task 11: Roteamento, composição da landing e orquestração de scroll

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/Home.tsx`

**Interfaces:**
- Consumes: todas as seções e a página de checkout.
- Produces: rotas `/` (Home = SaveTheDate + GiftList + GiftTable) e `/presente/:id` (GiftCheckout).

- [ ] **Step 1: `Home.tsx`**

```tsx
import { SaveTheDate } from "../sections/SaveTheDate";
import { GiftList } from "../sections/GiftList";
import { GiftTable } from "../sections/GiftTable";

export default function Home() {
  return (
    <main>
      <SaveTheDate />
      <GiftList />
      <GiftTable />
    </main>
  );
}
```
(Ajustar imports default/nomeado conforme implementado nas seções — manter consistente.)

- [ ] **Step 2: `App.tsx` com rotas**

```tsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GiftCheckout from "./pages/GiftCheckout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/presente/:id" element={<GiftCheckout />} />
    </Routes>
  );
}
```

- [ ] **Step 3: Transições entre seções**

Garantir que a transição Save the Date → Lista esteja suave (a Seção 2 surge conforme os assets da 1 saem). Ajustar `min-height`/spacing das seções para o parallax encadear bem. Revisar com `review-animations`.

- [ ] **Step 4: Build + screenshot da página inteira (scroll completo) + GLM review final de composição**

`npm run build` (deve passar `tsc`), `npm run preview`, percorrer a página toda, screenshots em pontos-chave, `design-review.ts` com contexto "composição geral das 3 seções". Ajustar.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/Home.tsx
git commit -m "feat: roteamento e composição da landing (3 seções + checkout)"
```

---

### Task 12: Polimento de animação + loop de validação final com GLM

**Files:**
- Modify: componentes/seções conforme os ajustes.

- [ ] **Step 1: Instalar e usar skills de animação**

Run: `npx skills add emilkowalski/skill`
Usar `emil-design-eng` para refinar curvas/timing (flutuação, parallax, modal, transição de rota) e `review-animations` para auditar. Aplicar recomendações.

- [ ] **Step 2: Loop de design com GLM 5.2 (até ficar redondo)**

Para cada tela (Save the Date, Lista, Checkout, Mesa, Modal): screenshot → `scripts/design-review.ts` → aplicar ajustes → repetir até nota alta e **zero** violação das regras duras (sem neon/sombra/degradê/borda). Registrar no commit um resumo das notas finais.

- [ ] **Step 3: Checagem manual das regras de ouro**

`grep -rin "box-shadow\|gradient\|drop-shadow" src` → deve voltar vazio (ou só comentários explicando a proibição). Corrigir qualquer ocorrência.

- [ ] **Step 4: Responsividade**

Conferir mobile (≤480px) e desktop: assets não estouram, texto legível, grid de presentes empilha. Ajustar CSS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "polish: animações refinadas (emil) e ajustes do loop de validação com GLM"
```

---

### Task 13: QA final, build e README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Rodar toda a suíte de testes**

Run: `npm run test`
Expected: todos os testes PASS (pix, gifts, giftTable, smokes de componentes).

- [ ] **Step 2: QA com a skill `qa`/`browse`**

Fluxo completo: abrir `/`, rolar (parallax), escolher um presente, preencher nome/mensagem/foto, ver o Pix (QR + copiar funciona), Concluir, voltar e ver o presente novo na mesa, abrir o modal. Corrigir bugs achados.

- [ ] **Step 3: `README.md`**

Documentar: o que é, como rodar (`npm install`, `npm run dev`), como gerar assets (`node --env-file=.env scripts/generate-assets.ts`), como buildar (`npm run build`), e o aviso de que tudo é mockado/estático e o Pix não tem validação. Mencionar `.env` (não commitar a chave; rotacionar a chave exposta).

- [ ] **Step 4: Build final**

Run: `npm run build && npm run preview`
Expected: build limpo, site servindo em `dist/`.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: README e QA final"
```

---

## Self-Review (cobertura do spec)

- ✅ Stack Vite+React+TS, estático → Task 1, 11, 13
- ✅ Regras de ouro (sem neon/sombra/borda/degradê) → tokens/global Task 1, checagem Task 12.3
- ✅ Paleta pastel + fontes → Task 1
- ✅ Assets NanoBanana Pro via OpenRouter → Task 5
- ✅ Save the Date (nomes, &, data, local) + flutuação + parallax → Task 7
- ✅ Lista de presentes mockada + clique → checkout → Task 8
- ✅ Checkout com nome/mensagem/foto + Pix (CPF/QR/copia-e-cola) + Concluir → Task 9, 2
- ✅ Mesa de presentes (seeds + localStorage) + avatar + modal → Task 10, 4
- ✅ Validação com GLM 5.2 via OpenRouter → Task 5, 7, 8, 9, 10, 12
- ✅ Animação com Motion + skills Emil → Task 6, 7, 11, 12
- ✅ Segredo fora do git → Task 1, 5
