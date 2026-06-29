import { mkdir, writeFile, access } from "node:fs/promises";
import sharp from "sharp";
import { generateImage } from "./openrouter.ts";
import { ASSET_PROMPTS } from "./asset-prompts.ts";

const OUT = "public/assets";
const force = process.argv.includes("--force");
const noKey = process.argv.includes("--no-key");
const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];

// Remove o fundo verde chroma-key, deixando o PNG transparente de verdade.
async function chromaKeyGreen(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (g > 150 && g - r > 55 && g - b > 55) {
      // verde forte -> totalmente transparente
      data[i + 3] = 0;
    } else if (g > 110 && g - r > 28 && g - b > 28) {
      // borda esverdeada -> meia transparência + tira o "spill" verde
      data[i + 3] = Math.round(data[i + 3] * 0.35);
      data[i + 1] = Math.round((r + b) / 2);
    }
  }
  return sharp(data, { raw: { width, height, channels } })
    .trim({ threshold: 0 })
    .png()
    .toBuffer();
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

await mkdir(OUT, { recursive: true });

const list = only ? ASSET_PROMPTS.filter((a) => a.file.includes(only)) : ASSET_PROMPTS;
let okCount = 0;
let failCount = 0;

for (const { file, prompt } of list) {
  const path = `${OUT}/${file}`;
  if (!force && (await exists(path))) {
    console.log("skip (existe):", file);
    continue;
  }
  try {
    process.stdout.write(`gerando ${file} ... `);
    const raw = await generateImage(prompt);
    const out = noKey ? raw : await chromaKeyGreen(raw);
    await writeFile(path, out);
    console.log(`ok (${(out.length / 1024).toFixed(0)} KB)`);
    okCount++;
  } catch (e) {
    console.log("FALHOU:", (e as Error).message);
    failCount++;
  }
}

console.log(`\nConcluido. ok=${okCount} falhou=${failCount}`);
