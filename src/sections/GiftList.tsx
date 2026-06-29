import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { GIFTS } from "../data/gifts";
import { FloatingAsset } from "../components/FloatingAsset";
import styles from "./GiftList.module.css";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function GiftList() {
  const navigate = useNavigate();

  return (
    <section className={styles.section} id="presentes">
      <FloatingAsset src="/assets/estrela-2.png" width={38} className={styles.decoA} duration={3} />
      <FloatingAsset src="/assets/nuvem-2.png" width={120} className={styles.decoB} duration={5.5} delay={0.4} />

      <div className={styles.head}>
        <h2 className={styles.titulo}>Escolha um presente</h2>
        <p className={styles.sub}>e mande uma mensagem para a Catarina e a Lúcia 💛</p>
      </div>

      <div className={styles.grid}>
        {GIFTS.map((g, i) => (
          <motion.button
            key={g.id}
            className={styles.card}
            initial={{ rotate: i % 2 === 0 ? -2 : 2 }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            onClick={() => navigate(`/presente/${g.id}`)}
          >
            <img src={g.asset} alt={g.nome} className={styles.cardImg} />
            <span className={styles.cardNome}>{g.nome}</span>
            <span className={styles.cardPreco}>{brl(g.preco)}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
