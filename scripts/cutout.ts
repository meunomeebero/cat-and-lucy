// Recorta o fundo ACROMÁTICO (cinza / xadrez / branco) dos assets do NanoBanana Pro
// via flood-fill a partir das bordas. Os sujeitos são coloridos (pastéis saturados),
// então removemos só o que é acromático E conectado à borda. Sem créditos, sem ML.
import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";

const S_TOL = 32; // diferença max-min de canais p/ considerar "acromático" (cinza/branco)
const EDGE_TOL = 46; // limpeza de halo na borda

export async function cutout(input: string): Promise<Buffer> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const N = w * h;
  const bg = new Uint8Array(N);
  const isAch = (i: number) => {
    const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
    return Math.max(r, g, b) - Math.min(r, g, b) <= S_TOL;
  };
  const stack: number[] = [];
  const pushIf = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (bg[i]) return;
    if (isAch(i)) {
      bg[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    pushIf(x, 0);
    pushIf(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushIf(0, y);
    pushIf(w - 1, y);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = (i - x) / w;
    pushIf(x + 1, y);
    pushIf(x - 1, y);
    pushIf(x, y + 1);
    pushIf(x, y - 1);
  }
  for (let i = 0; i < N; i++) if (bg[i]) data[i * ch + 3] = 0;
  // segunda passada: amacia o halo nas bordas mantidas
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (bg[i]) continue;
      let t = 0;
      if (x + 1 < w && bg[i + 1]) t++;
      if (x > 0 && bg[i - 1]) t++;
      if (y + 1 < h && bg[i + w]) t++;
      if (y > 0 && bg[i - w]) t++;
      if (t > 0) {
        const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
        if (Math.max(r, g, b) - Math.min(r, g, b) < EDGE_TOL) data[i * ch + 3] = Math.round(data[i * ch + 3] * 0.5);
      }
    }
  }
  return sharp(data, { raw: { width: w, height: h, channels: ch } }).trim({ threshold: 0 }).png().toBuffer();
}

// --- CLI ---
const mode = process.argv[2] ?? "preview"; // preview | apply
const DIR = "public/assets";
const files = (await readdir(DIR)).filter((f) => f.endsWith(".png"));

// só processa os que ainda têm fundo opaco (hasAlpha=false)
const targets: string[] = [];
for (const f of files) {
  const m = await sharp(`${DIR}/${f}`).metadata();
  if (!m.hasAlpha) targets.push(f);
}
console.log(`${targets.length} assets com fundo opaco:`, targets.join(", "));

if (mode === "apply") {
  for (const f of targets) {
    const buf = await cutout(`${DIR}/${f}`);
    await writeFile(`${DIR}/${f}`, buf);
    console.log("recortado:", f);
  }
  console.log("OK aplicado.");
} else {
  await mkdir("/tmp/cut", { recursive: true });
  const tiles: Buffer[] = [];
  for (const f of targets) {
    const buf = await cutout(`${DIR}/${f}`);
    await writeFile(`/tmp/cut/${f}`, buf);
    tiles.push(
      await sharp(buf).resize(150, 150, { fit: "contain", background: { r: 255, g: 0, b: 255, alpha: 1 } }).png().toBuffer(),
    );
  }
  const cols = 6;
  const rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: 150 * cols, height: 150 * rows, channels: 4, background: { r: 255, g: 0, b: 255, alpha: 1 } } })
    .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * 150, top: Math.floor(i / cols) * 150 })))
    .png()
    .toFile("/tmp/cut/_montage.png");
  console.log("preview em /tmp/cut/, montagem em /tmp/cut/_montage.png");
}
