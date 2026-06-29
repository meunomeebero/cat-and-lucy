import { readFile } from "node:fs/promises";

const API = "https://openrouter.ai/api/v1";
const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) throw new Error("OPENROUTER_API_KEY ausente (rode com: node --env-file=.env ...)");

const IMAGE_MODEL = process.env.IMAGE_MODEL ?? "google/gemini-3-pro-image";
const GLM_MODEL = process.env.GLM_MODEL ?? "z-ai/glm-5v-turbo";

const HEADERS = {
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  "HTTP-Referer": "https://festa-catarina-lucia.local",
  "X-Title": "Festa Catarina & Lucia",
};

async function chat(body: unknown, tries = 3): Promise<any> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${API}/chat/completions`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 400)}`);
      }
      return await res.json();
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr;
}

function extractImage(data: any): string | undefined {
  const msg = data?.choices?.[0]?.message;
  if (!msg) return undefined;
  const imgs = msg.images;
  if (Array.isArray(imgs) && imgs[0]?.image_url?.url) return imgs[0].image_url.url;
  if (Array.isArray(msg.content)) {
    for (const part of msg.content) {
      if (part?.image_url?.url) return part.image_url.url;
      if (typeof part?.url === "string" && part.url.startsWith("data:image")) return part.url;
    }
  }
  return undefined;
}

export async function generateImage(prompt: string, opts: { model?: string } = {}): Promise<Buffer> {
  const data = await chat({
    model: opts.model ?? IMAGE_MODEL,
    modalities: ["image", "text"],
    messages: [{ role: "user", content: prompt }],
  });
  const url = extractImage(data);
  if (!url) throw new Error("Sem imagem na resposta: " + JSON.stringify(data).slice(0, 600));
  const base64 = url.includes(",") ? url.split(",")[1] : url;
  return Buffer.from(base64, "base64");
}

export async function reviewDesign(
  imagePath: string,
  instrucoes: string,
  opts: { model?: string } = {},
): Promise<string> {
  const img = await readFile(imagePath);
  const dataUrl = `data:image/png;base64,${img.toString("base64")}`;
  const data = await chat({
    model: opts.model ?? GLM_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: instrucoes },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  });
  return data?.choices?.[0]?.message?.content ?? "";
}

export async function listModels(filter: string): Promise<string[]> {
  const res = await fetch(`${API}/models`, { headers: { Authorization: `Bearer ${KEY}` } });
  const data = await res.json();
  return data.data.map((m: any) => m.id).filter((id: string) => id.includes(filter));
}
