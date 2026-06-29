import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getSentGifts, type SentGift } from "../lib/giftTable";
import { getGiftById } from "../data/gifts";
import { Avatar } from "../components/Avatar";
import { GiftModal } from "../components/GiftModal";
import { FloatingAsset } from "../components/FloatingAsset";
import styles from "./GiftTable.module.css";

const FALLBACK = "/assets/presente-1.png";
const ROTACOES = [-5, 4, -3, 6, -6, 3, 5, -4, 2, -2];

export function GiftTable() {
  const [gifts, setGifts] = useState<SentGift[]>([]);
  const [sel, setSel] = useState<SentGift | null>(null);

  useEffect(() => {
    setGifts(getSentGifts());
  }, []);

  return (
    <section className={styles.section} id="mesa">
      <FloatingAsset src="/assets/nuvem-1.png" width={130} className={styles.deco1} duration={6} floatRange={10} />
      <FloatingAsset src="/assets/estrela-1.png" width={42} className={styles.deco2} duration={3} delay={0.5} />

      <div className={styles.head}>
        <h2 className={styles.titulo}>Mesa de presentes</h2>
        <p className={styles.sub}>Cada presentinho é um carinho que chegou pra Catarina e a Lúcia 🎁</p>
      </div>

      <div className={styles.mesa}>
        {gifts.map((g, i) => {
          const rot = ROTACOES[i % ROTACOES.length];
          const asset = getGiftById(g.giftId)?.asset ?? FALLBACK;
          return (
            <motion.button
              key={g.id}
              className={styles.item}
              initial={{ rotate: rot }}
              animate={{ y: [0, -12, 0], rotate: rot }}
              transition={{
                duration: 4 + (i % 4) * 0.5,
                delay: (i % 5) * 0.25,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.07 }}
              onClick={() => setSel(g)}
            >
              <span className={styles.avatarOver}>
                <Avatar foto={g.foto} nome={g.nomeRemetente} size={46} />
              </span>
              <img src={asset} alt={g.giftNome} className={styles.giftImg} />
              <span className={styles.itemNome}>{g.nomeRemetente}</span>
            </motion.button>
          );
        })}
      </div>

      <GiftModal gift={sel} onClose={() => setSel(null)} />
    </section>
  );
}
