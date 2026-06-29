import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { getGiftById } from "../data/gifts";
import { buildPixPayload } from "../lib/pix";
import { addSentGift } from "../lib/giftTable";
import { PixBox } from "../components/PixBox";
import { FloatingAsset } from "../components/FloatingAsset";
import styles from "./GiftCheckout.module.css";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function GiftCheckout() {
  const { id } = useParams();
  const gift = id ? getGiftById(id) : undefined;

  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [enviado, setEnviado] = useState(false);

  if (!gift) {
    return (
      <main className={styles.naoAchou}>
        <h1 className={styles.obrigadoTitulo}>Ops!</h1>
        <p className={styles.obrigadoTexto}>Não encontramos esse presente.</p>
        <Link to="/" className={styles.botaoMesa}>
          Voltar pra festa
        </Link>
      </main>
    );
  }

  const payload = buildPixPayload({
    key: "03641745284",
    amount: gift.preco,
    merchantName: "Roberto Rocha da Costa Junior",
    merchantCity: "SAO JOSE CAMPOS",
    txid: gift.id,
  });

  const onConcluir = () => {
    if (!nome.trim()) {
      setErro(true);
      return;
    }
    addSentGift({
      nomeRemetente: nome.trim(),
      mensagem: mensagem.trim(),
      giftId: gift.id,
      giftNome: gift.nome,
    });
    setEnviado(true);
  };

  if (enviado) {
    return (
      <motion.main
        className={styles.obrigado}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <FloatingAsset src="/assets/coroa-1.png" width={110} duration={4} />
        <h1 className={styles.obrigadoTitulo}>Presente enviado!</h1>
        <p className={styles.obrigadoTexto}>
          Muito obrigado, {nome.trim()}! Seu presentinho já foi pra mesa da Catarina e da Lúcia. 💛
        </p>
        <div className={styles.obrigadoBotoes}>
          <a href="/#mesa" className={styles.botaoMesa}>
            Ver a mesa de presentes
          </a>
          <Link to="/" className={styles.botaoTopo}>
            Voltar pro começo
          </Link>
        </div>
      </motion.main>
    );
  }

  return (
    <main className={styles.page}>
      <FloatingAsset src="/assets/balao-lilas.png" width={70} className={styles.deco1} duration={5} />
      <FloatingAsset src="/assets/estrela-1.png" width={36} className={styles.deco2} duration={3} delay={0.4} />

      <Link to="/" className={styles.voltar}>
        ← voltar
      </Link>

      <div className={styles.wrap}>
        <div className={styles.gift}>
          <img src={gift.asset} alt={gift.nome} className={styles.giftImg} />
          <div className={styles.giftInfo}>
            <span className={styles.giftLabel}>Presente escolhido</span>
            <span className={styles.giftNome}>{gift.nome}</span>
            <span className={styles.giftPreco}>{brl(gift.preco)}</span>
          </div>
        </div>

        <div className={styles.form}>
          <div className={styles.campo}>
            <label className={styles.campoLabel} htmlFor="nome">
              De quem é o presente?
            </label>
            <input
              id="nome"
              className={`${styles.input} ${erro ? styles.inputErro : ""}`}
              placeholder="Ex.: Presente da família Souza"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (erro) setErro(false);
              }}
            />
            {erro && <span className={styles.aviso}>Conta pra gente quem está mandando 💛</span>}
          </div>

          <div className={styles.campo}>
            <label className={styles.campoLabel} htmlFor="mensagem">
              Mensagem para as meninas
            </label>
            <textarea
              id="mensagem"
              className={styles.textarea}
              placeholder="Escreva um carinho..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>
        </div>

        <PixBox payload={payload} chave="036.417.452-84" valor={gift.preco} favorecido="Roberto Rocha da Costa Junior" />

        <motion.button className={styles.concluir} whileTap={{ scale: 0.97 }} onClick={onConcluir}>
          Concluir
        </motion.button>
      </div>
    </main>
  );
}
