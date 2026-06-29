import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import styles from "./PixBox.module.css";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type PixBoxProps = {
  payload: string;
  chave: string;
  valor: number;
  favorecido: string;
};

export function PixBox({ payload, chave, valor, favorecido }: PixBoxProps) {
  const [copiado, setCopiado] = useState<"" | "chave" | "codigo">("");

  const copiar = async (texto: string, qual: "chave" | "codigo") => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(qual);
      setTimeout(() => setCopiado(""), 1800);
    } catch {
      // navegadores sem clipboard: ignora silenciosamente
    }
  };

  return (
    <div className={styles.box}>
      <h3 className={styles.titulo}>Pague com Pix</h3>
      <div className={styles.qrWrap}>
        <QRCodeSVG value={payload} size={172} bgColor="transparent" fgColor="#6b5847" />
      </div>
      <p className={styles.valor}>{brl(valor)}</p>

      <div className={styles.linha}>
        <span className={styles.label}>Chave Pix (CPF)</span>
        <div className={styles.valorLinha}>
          <span className={styles.chave}>{chave}</span>
          <button className={styles.copiar} onClick={() => copiar(chave.replace(/\D/g, ""), "chave")}>
            {copiado === "chave" ? "copiado!" : "copiar"}
          </button>
        </div>
      </div>

      <button className={styles.copiaCola} onClick={() => copiar(payload, "codigo")}>
        {copiado === "codigo" ? "código copiado! 💛" : "copiar código Pix (copia e cola)"}
      </button>

      <p className={styles.favorecido}>Favorecido: {favorecido}</p>
      <p className={styles.dica}>Confira o nome do favorecido ao fazer a transferência.</p>
    </div>
  );
}
