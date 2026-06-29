import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getSentGifts, type SentGift } from "../lib/giftTable";
import { getGiftById } from "../data/gifts";
import { Avatar } from "../components/Avatar";
import { GiftModal } from "../components/GiftModal";
import { FloatingAsset } from "../components/FloatingAsset";
import { playPop } from "../lib/sounds";
import styles from "./GiftTable.module.css";

const FALLBACK = "/assets/presente-1.png";
const ROTACOES = [-5, 4, -3, 6, -6, 3, 5, -4, 2, -2];
const STAGGER = [0, 30, 10, 36, 4, 22, 14, 2, 26, 8]; // desalinha verticalmente
const ESCALAS = [1, 0.92, 1.07, 0.96, 1.04, 0.9, 1.02, 0.94, 1.06, 0.98];

// Performance: abaixo de FLOAT_THRESHOLD presentes, todos flutuam. Acima, só um
// subconjunto distribuído flutua (no máx. ~MAX_FLOATERS) — visual quase idêntico,
// mas o número de animações simultâneas para de crescer (suave em celular fraco).
const FLOAT_THRESHOLD = 40;
const MAX_FLOATERS = 24;

export function GiftTable() {
  const [gifts, setGifts] = useState<SentGift[]>([]);
  const [sel, setSel] = useState<SentGift | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let alive = true;
    getSentGifts()
      .then((g) => alive && (setGifts(g), setLoading(false)))
      .catch(() => alive && (setErro(true), setLoading(false)));
    return () => {
      alive = false;
    };
  }, []);

  const total = gifts.length;
  const stride = total > FLOAT_THRESHOLD ? Math.ceil(total / MAX_FLOATERS) : 1;

  return (
    <section className={styles.section} id="mesa">
      <FloatingAsset src="/assets/nuvem-1.png" width={120} className={styles.deco1} duration={6} floatRange={10} />
      <FloatingAsset src="/assets/estrela-1.png" width={40} className={styles.deco2} duration={3} delay={0.5} />
      <FloatingAsset src="/assets/estrela-2.png" width={34} className={styles.deco3} duration={3.4} delay={0.2} />
      <FloatingAsset src="/assets/brilho-1.png" width={30} className={styles.deco4} duration={2.8} delay={0.8} />
      <FloatingAsset src="/assets/confete-1.png" width={90} className={styles.deco5} duration={5} delay={0.3} floatRange={8} />
      <FloatingAsset src="/assets/balao-amarelo.png" width={56} className={styles.deco6} duration={5.5} delay={0.6} floatRange={14} />

      <div className={styles.head}>
        <h2 className={styles.titulo}>Mesa de presentes</h2>
        <p className={styles.sub}>Cada presentinho é um carinho que chegou pra Catarina e a Lucia</p>
      </div>

      {loading ? (
        <p className={styles.estado}>carregando os presentinhos...</p>
      ) : erro ? (
        <p className={styles.estado}>Não consegui abrir a mesa agora. Tenta de novo daqui a pouco 💛</p>
      ) : gifts.length === 0 ? (
        <p className={styles.estado}>A mesa ainda está vazia... seja o primeiro a deixar um carinho!</p>
      ) : (
        <div className={styles.mesa}>
          {gifts.map((g, i) => {
            const rot = ROTACOES[i % ROTACOES.length];
            const sc = ESCALAS[i % ESCALAS.length];
            const asset = getGiftById(g.giftId)?.asset ?? FALLBACK;
            const floating = total <= FLOAT_THRESHOLD || i % stride === 0;
            return (
              <motion.button
                key={g.id}
                className={styles.item}
                style={{ marginTop: STAGGER[i % STAGGER.length] }}
                initial={{ rotate: rot, scale: sc }}
                animate={
                  floating ? { y: [0, -12, 0], rotate: rot, scale: sc } : { y: 0, rotate: rot, scale: sc }
                }
                transition={
                  floating
                    ? { duration: 4 + (i % 4) * 0.5, delay: (i % 5) * 0.25, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0 }
                }
                whileHover={{ scale: sc + 0.08 }}
                onClick={() => {
                  playPop();
                  setSel(g);
                }}
              >
                <span className={styles.avatarOver}>
                  <Avatar nome={g.nomeRemetente} size={46} />
                </span>
                <img src={asset} alt={g.giftNome} className={styles.giftImg} />
                <span className={styles.itemNome}>{g.nomeRemetente}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      <GiftModal gift={sel} onClose={() => setSel(null)} />
    </section>
  );
}
