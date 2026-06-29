import { AnimatePresence, motion } from "motion/react";
import type { SentGift } from "../lib/giftTable";
import { getGiftById } from "../data/gifts";
import { Avatar } from "./Avatar";
import styles from "./GiftModal.module.css";

const FALLBACK = "/assets/presente-1.png";

export type GiftModalProps = {
  gift: SentGift | null;
  onClose: () => void;
};

export function GiftModal({ gift, onClose }: GiftModalProps) {
  return (
    <AnimatePresence>
      {gift && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.card}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <button className={styles.fechar} onClick={onClose} aria-label="fechar">
              ×
            </button>
            <div className={styles.avatarWrap}>
              <Avatar foto={gift.foto} nome={gift.nomeRemetente} size={84} />
            </div>
            <h3 className={styles.titulo}>Presente da {gift.nomeRemetente}</h3>
            <img
              src={getGiftById(gift.giftId)?.asset ?? FALLBACK}
              alt={gift.giftNome}
              className={styles.giftImg}
            />
            <p className={styles.giftNome}>{gift.giftNome}</p>
            {gift.mensagem && <p className={styles.mensagem}>“{gift.mensagem}”</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
