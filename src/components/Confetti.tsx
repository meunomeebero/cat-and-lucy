import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./Confetti.module.css";

// Chuva de confete pastel (sem sombra/degradê/borda/neon — só as cores do tema).
// Determinístico por índice; some sozinho depois de `duration`.
const CORES = [
  "var(--rosa)",
  "var(--rosa-forte)",
  "var(--amarelo)",
  "var(--amarelo-forte)",
  "var(--lilas)",
  "var(--menta)",
];

export function Confetti({ pieces = 46, duration = 3200 }: { pieces?: number; duration?: number }) {
  const [on, setOn] = useState(true);
  const reduzirMovimento = useReducedMotion();
  useEffect(() => {
    const t = setTimeout(() => setOn(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  // quem pediu menos movimento não recebe a chuva de 46 partículas
  if (!on || reduzirMovimento) return null;

  return (
    <div className={styles.wrap} aria-hidden>
      {Array.from({ length: pieces }, (_, i) => {
        const left = (i * 61) % 100; // espalha na horizontal
        const cor = CORES[i % CORES.length];
        const w = 8 + (i % 4) * 3; // 8..17
        const delay = (i % 8) * 0.11;
        const dur = 2.3 + (i % 5) * 0.34;
        const drift = ((i % 5) - 2) * 26; // deriva lateral
        const rot = (i % 2 ? 1 : -1) * (200 + (i % 3) * 140);
        return (
          <motion.span
            key={i}
            className={styles.peca}
            style={{ left: `${left}%`, width: w, height: w * 0.6, backgroundColor: cor }}
            initial={{ y: "-12vh", x: 0, rotate: 0, opacity: 1 }}
            animate={{ y: "112vh", x: drift, rotate: rot, opacity: [1, 1, 0.85, 0] }}
            transition={{ duration: dur, delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}
