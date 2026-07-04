import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useCart } from "../lib/cart";
import { buildPixPayload } from "../lib/pix";
import { addSentGift } from "../lib/giftTable";
import { PixBox } from "../components/PixBox";
import { FloatingAsset } from "../components/FloatingAsset";
import { playPop, playTwinkle } from "../lib/sounds";
import styles from "./CartCheckout.module.css";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CartCheckout() {
  const { linhas, add, remove, total, totalItens, limpar } = useCart();

  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState(false);
  const [cartaoLoading, setCartaoLoading] = useState(false);
  const [erroCartao, setErroCartao] = useState(false);

  const itensParaEnvio = () =>
    linhas.map((l) => ({
      giftId: l.gift.id,
      nome: l.gift.nome,
      empresa: l.gift.empresa,
      preco: l.gift.preco,
      quantidade: l.quantidade,
    }));

  // Cartão parcelado via Asaas: cria a cobrança e redireciona pro checkout hospedado.
  const onCartao = async () => {
    if (!nome.trim()) {
      setErro(true);
      return;
    }
    playPop();
    setCartaoLoading(true);
    setErroCartao(false);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nomeRemetente: nome.trim(), mensagem: mensagem.trim(), itens: itensParaEnvio() }),
      });
      if (!res.ok) throw new Error("checkout falhou");
      const data = (await res.json()) as { invoiceUrl?: string | null };
      if (!data.invoiceUrl) throw new Error("sem invoiceUrl");
      limpar();
      window.location.href = data.invoiceUrl; // vai pro checkout do Asaas (escolhe as parcelas lá)
    } catch {
      setErroCartao(true);
      setCartaoLoading(false);
    }
  };

  const onConcluir = async () => {
    if (!nome.trim()) {
      setErro(true);
      return;
    }
    playPop();
    setEnviando(true);
    setErroEnvio(false);
    try {
      await addSentGift({
        nomeRemetente: nome.trim(),
        mensagem: mensagem.trim(),
        itens: linhas.map((l) => ({
          giftId: l.gift.id,
          nome: l.gift.nome,
          empresa: l.gift.empresa,
          preco: l.gift.preco,
          quantidade: l.quantidade,
        })),
        total,
      });
      playTwinkle();
      setEnviado(true);
      limpar();
    } catch {
      setErroEnvio(true);
    } finally {
      setEnviando(false);
    }
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
        <h1 className={styles.obrigadoTitulo}>Presentes enviados!</h1>
        <p className={styles.obrigadoTexto}>
          Muito obrigado, {nome.trim()}! Seus presentinhos já foram pra mesa da Catarina e da Lucia. 💛
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

  if (linhas.length === 0) {
    return (
      <main className={styles.naoAchou}>
        <FloatingAsset src="/assets/balao-lilas.png" width={80} duration={5} />
        <h1 className={styles.obrigadoTitulo}>Sua sacola está vazia</h1>
        <p className={styles.obrigadoTexto}>Escolha um ou mais presentes pra Catarina e a Lucia 💛</p>
        <Link to="/#presentes" className={styles.botaoMesa}>
          Escolher presentes
        </Link>
      </main>
    );
  }

  const payload = buildPixPayload({
    key: "03641745284",
    amount: total,
    merchantName: "Roberto Rocha da Costa Junior",
    merchantCity: "SAO JOSE CAMPOS",
    txid: "PRESENTES",
  });

  return (
    <main className={styles.page}>
      <FloatingAsset src="/assets/estrela-1.png" width={36} className={styles.deco1} duration={3} />
      <FloatingAsset src="/assets/nuvem-2.png" width={100} className={styles.deco2} duration={5.5} delay={0.4} />

      <Link to="/#presentes" className={styles.voltar}>
        ← escolher mais
      </Link>

      <div className={styles.wrap}>
        <h1 className={styles.titulo}>Seus presentes</h1>

        <div className={styles.itens}>
          {linhas.map((l) => (
            <div key={l.gift.id} className={styles.item}>
              <img src={l.gift.asset} alt={l.gift.nome} className={styles.itemImg} />
              <div className={styles.itemInfo}>
                <span className={styles.itemNome}>{l.gift.nome}</span>
                {l.gift.empresa && <span className={styles.itemEmpresa}>{l.gift.empresa}</span>}
                <span className={styles.itemPreco}>{brl(l.gift.preco)} cada</span>
                <button
                  className={styles.remover}
                  onClick={() => {
                    playPop();
                    remove(l.gift.id);
                  }}
                >
                  remover
                </button>
              </div>
              <div className={styles.itemDireita}>
                <div className={styles.stepper}>
                  <button
                    className={styles.stepBtn}
                    aria-label="diminuir"
                    onClick={() => {
                      playPop();
                      add(l.gift.id, -1);
                    }}
                  >
                    −
                  </button>
                  <span className={styles.stepQtd}>{l.quantidade}</span>
                  <button
                    className={styles.stepBtn}
                    aria-label="aumentar"
                    onClick={() => {
                      playPop();
                      add(l.gift.id);
                    }}
                  >
                    +
                  </button>
                </div>
                <span className={styles.itemSubtotal}>{brl(l.gift.preco * l.quantidade)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.form}>
          <div className={styles.campo}>
            <label className={styles.campoLabel} htmlFor="nome">
              De quem são os presentes?
            </label>
            <input
              id="nome"
              className={`${styles.input} ${erro ? styles.inputErro : ""}`}
              placeholder="Ex.: Família Souza"
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

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>
            Total · {totalItens} {totalItens === 1 ? "item" : "itens"}
          </span>
          <span className={styles.totalValor}>{brl(total)}</span>
        </div>

        <div className={styles.metodos}>
          <h3 className={styles.metodosTitulo}>Como quer pagar?</h3>

          <div className={styles.metodo}>
            <span className={styles.metodoTag}>Pix · na hora, sem taxa</span>
            <PixBox payload={payload} chave="036.417.452-84" valor={total} favorecido="Roberto Rocha da Costa Junior" />
            <motion.button
              className={styles.concluir}
              whileTap={{ scale: 0.97 }}
              onClick={onConcluir}
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Já paguei no Pix — enviar presentes"}
            </motion.button>
            {erroEnvio && <span className={styles.aviso}>Ops, não consegui enviar agora. Tenta de novo? 💛</span>}
          </div>

          <div className={styles.metodo}>
            <span className={styles.metodoTag}>Cartão · parcele no crédito</span>
            <motion.button
              className={styles.cartaoBtn}
              whileTap={{ scale: 0.97 }}
              onClick={onCartao}
              disabled={cartaoLoading}
            >
              {cartaoLoading ? "Abrindo pagamento..." : `Pagar ${brl(total)} no cartão`}
            </motion.button>
            <p className={styles.recebedor}>Recebedor: BEROLAB LTDA · CNPJ 61.026.871/0001-79</p>
            {erroCartao && (
              <span className={styles.aviso}>Não consegui abrir o pagamento no cartão. Tenta de novo? 💛</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
