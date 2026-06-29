// Efeitos sonoros fofos sintetizados na hora (Web Audio API) — sem arquivos.
// Volume baixo e gentil. No-op em ambientes sem AudioContext (SSR/testes).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  c: AudioContext,
  type: OscillatorType,
  freqFrom: number,
  freqTo: number,
  at: number,
  dur: number,
  vol: number,
) {
  const osc = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

// "bloop" fofo pra cliques em geral
export function playPop() {
  const c = getCtx();
  if (!c) return;
  tone(c, "sine", 860, 440, 0, 0.13, 0.13);
  tone(c, "triangle", 1300, 1300, 0, 0.05, 0.04);
}

// "twinkle" alegre pra sucesso (presente enviado)
export function playTwinkle() {
  const c = getCtx();
  if (!c) return;
  const notes = [660, 880, 1175, 1568];
  notes.forEach((f, i) => tone(c, "triangle", f, f, i * 0.085, 0.18, 0.1));
}
