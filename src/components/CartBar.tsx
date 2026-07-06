import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../lib/cart";
import { playPop } from "../lib/sounds";
import styles from "./CartBar.module.css";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CartBar() {
  const { totalItens, total } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {totalItens > 0 && (
        <motion.button
          className={styles.bar}
          // o x:"-50%" centraliza (motion escreve o transform inline e engoliria
          // o translateX do CSS, então a centralização vive aqui)
          initial={{ y: 90, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 90, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            playPop();
            navigate("/finalizar");
          }}
        >
          <span className={styles.count}>{totalItens}</span>
          <span className={styles.label}>Enviar {totalItens === 1 ? "presente" : "presentes"}</span>
          <span className={styles.total}>{brl(total)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
