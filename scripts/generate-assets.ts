import { mkdir, writeFile, access } from "node:fs/promises";
import { generateImage } from "./openrouter.ts";
import { ASSET_PROMPTS } from "./asset-prompts.ts";

const OUT = "public/assets";
const force = process.argv.includes("--force");
const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];

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
    const buf = await generateImage(prompt);
    await writeFile(path, buf);
    console.log(`ok (${(buf.length / 1024).toFixed(0)} KB)`);
    okCount++;
  } catch (e) {
    console.log("FALHOU:", (e as Error).message);
    failCount++;
  }
}

console.log(`\nConcluido. ok=${okCount} falhou=${failCount}`);
