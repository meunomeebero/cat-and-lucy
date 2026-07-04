import { motion } from "motion/react";
import { GIFTS } from "../data/gifts";
import { FloatingAsset } from "../components/FloatingAsset";
import { useCart } from "../lib/cart";
import { playPop } from "../lib/sounds";
import styles from "./GiftList.module.css";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ROT = [-4, 3, -2.5, 4, -3, 2.5];
const DY = [10, -7, 13, -4, 7, -10];
const WASHI: Record<number, { cls: string; rot: number; left: string }> = {
  0: { cls: "washiRosa", rot: -11, left: "40%" },
  3: { cls: "washiLilas", rot: 8, left: "58%" },
  4: { cls: "washiAmarelo", rot: -4, left: "47%" },
};

export function GiftList() {
  const { quantidadeDe, add } = useCart();

  return (
    <section className={styles.section} id="presentes">
      <FloatingAsset src="/assets/estrela-2.png" width={38} className={styles.decoA} duration={3} />
      <FloatingAsset src="/assets/nuvem-2.png" width={120} className={styles.decoB} duration={5.5} delay={0.4} />
      <FloatingAsset src="/assets/confete-1.png" width={80} className={styles.decoC} duration={5} delay={0.2} floatRange={7} />
      <FloatingAsset src="/assets/brilho-1.png" width={28} className={styles.decoD} duration={2.8} delay={0.6} />

      <div className={styles.head}>
        <h2 className={styles.titulo}>Escolha os presentes</h2>
        <p className={styles.sub}>para a Catarina e a Lucia 💛 escolha quantos quiser (um pra cada!)</p>
      </div>

      <div className={styles.grid}>
        {GIFTS.map((g, i) => {
          const qtd = quantidadeDe(g.id);
          return (
            <motion.div
              key={g.id}
              className={qtd > 0 ? `${styles.card} ${styles.cardOn}` : styles.card}
              initial={{ rotate: ROT[i % ROT.length], y: DY[i % DY.length] }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {WASHI[i] && (
                <span
                  className={`${styles.washi} ${styles[WASHI[i].cls]}`}
                  style={{ left: WASHI[i].left, transform: `translateX(-50%) rotate(${WASHI[i].rot}deg)` }}
                  aria-hidden
                />
              )}
              {qtd > 0 && <span className={styles.badge}>{qtd}</span>}

              <img src={g.asset} alt={g.nome} className={styles.cardImg} />
              <span className={styles.cardNome}>{g.nome}</span>
              {g.empresa && <span className={styles.cardEmpresa}>{g.empresa}</span>}
              <span className={styles.cardPreco}>{brl(g.preco)}</span>

              {qtd === 0 ? (
                <button
                  className={styles.addBtn}
                  onClick={() => {
                    playPop();
                    add(g.id);
                  }}
                >
                  adicionar
                </button>
              ) : (
                <div className={styles.stepper}>
                  <button
                    className={styles.stepBtn}
                    aria-label="diminuir"
                    onClick={() => {
                      playPop();
                      add(g.id, -1);
                    }}
                  >
                    −
                  </button>
                  <span className={styles.stepQtd}>{qtd}</span>
                  <button
                    className={styles.stepBtn}
                    aria-label="aumentar"
                    onClick={() => {
                      playPop();
                      add(g.id);
                    }}
                  >
                    +
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
