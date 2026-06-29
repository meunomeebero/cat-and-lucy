import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { GIFTS } from "../data/gifts";
import { FloatingAsset } from "../components/FloatingAsset";
import styles from "./GiftList.module.css";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ROT = [-4, 3, -2.5, 4, -3, 2.5];
const DY = [10, -7, 13, -4, 7, -10];
// washi tape em alguns cards: cor, rotação (assimétrica) e posição horizontal
const WASHI: Record<number, { cls: string; rot: number; left: string }> = {
  0: { cls: "washiRosa", rot: -11, left: "40%" },
  3: { cls: "washiLilas", rot: 8, left: "58%" },
  4: { cls: "washiAmarelo", rot: -4, left: "47%" },
};

export function GiftList() {
  const navigate = useNavigate();

  return (
    <section className={styles.section} id="presentes">
      <FloatingAsset src="/assets/estrela-2.png" width={38} className={styles.decoA} duration={3} />
      <FloatingAsset src="/assets/nuvem-2.png" width={120} className={styles.decoB} duration={5.5} delay={0.4} />
      <FloatingAsset src="/assets/confete-1.png" width={80} className={styles.decoC} duration={5} delay={0.2} floatRange={7} />
      <FloatingAsset src="/assets/brilho-1.png" width={28} className={styles.decoD} duration={2.8} delay={0.6} />

      <div className={styles.head}>
        <h2 className={styles.titulo}>Escolha um presente</h2>
        <p className={styles.sub}>e mande uma mensagem para a Catarina e a Lúcia 💛</p>
      </div>

      <div className={styles.grid}>
        {GIFTS.map((g, i) => (
          <motion.button
            key={g.id}
            className={styles.card}
            initial={{ rotate: ROT[i % ROT.length], y: DY[i % DY.length] }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            onClick={() => navigate(`/presente/${g.id}`)}
          >
            {WASHI[i] && (
              <span
                className={`${styles.washi} ${styles[WASHI[i].cls]}`}
                style={{ left: WASHI[i].left, transform: `translateX(-50%) rotate(${WASHI[i].rot}deg)` }}
                aria-hidden
              />
            )}
            <img src={g.asset} alt={g.nome} className={styles.cardImg} />
            <span className={styles.cardNome}>{g.nome}</span>
            <span className={styles.cardPreco}>{brl(g.preco)}</span>
          </motion.button>
        ))}
      </div>

      {/* confete/brilho "por cima" dos cards (sem bloquear clique) */}
      <FloatingAsset src="/assets/confete-1.png" width={62} className={styles.over1} duration={4.5} delay={0.3} floatRange={6} />
      <FloatingAsset src="/assets/estrela-1.png" width={30} className={styles.over2} duration={3.2} delay={0.7} />
    </section>
  );
}
