import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../lib/cart";
import { FloatingAsset } from "../components/FloatingAsset";
import { PixSkeleton } from "../components/PixSkeleton";
import { playPop } from "../lib/sounds";
import styles from "./CartCheckout.module.css";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const RECEBEDOR = "Recebedor: BEROLAB LTDA · CNPJ 61.026.871/0001-79";

type PixData = { qrCodeImage: string; copiaECola: string };

export default function CartCheckout() {
  const { linhas, add, remove, total, totalItens, limpar } = useCart();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erroNome, setErroNome] = useState(false);
  const [erroCpf, setErroCpf] = useState(false);
  const [pixLoading, setPixLoading] = useState(false);
  const [cartaoLoading, setCartaoLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copiado, setCopiado] = useState(false);
  // pedido criado no Asaas: enquanto existe, a tela fica "aguardando pagamento"
  // e faz polling até confirmar (aí voa pra mesa com confete).
  const [orderId, setOrderId] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const aguardando = orderId !== null;

  useEffect(() => {
    if (!orderId) return;
    let alive = true;
    let tries = 0;
    let confirmadoSemPresente = 0; // confirmou mas o gift_id ainda não linkou (webhook em 3 passos)
    const parar = (fn: () => void) => {
      alive = false;
      clearInterval(id);
      fn();
    };
    const id = setInterval(async () => {
      if (!alive) return;
      if (++tries > 300) return void clearInterval(id); // ~20min de espera, então desiste
      try {
        const res = await fetch(`/api/order-status?id=${orderId}`);
        if (!res.ok) return;
        const data = (await res.json()) as { status: string; giftId: string | null };
        if (data.status === "confirmed") {
          // só voa pra mesa quando o presente já existe (senão o destaque não acha nada);
          // se demorar demais pra linkar, comemora genérico depois de ~12s.
          if (data.giftId) {
            parar(() => {
              setInvoiceUrl(null);
              limpar();
              navigate(`/?presente=${data.giftId}#mesa`);
            });
          } else if (++confirmadoSemPresente >= 3) {
            parar(() => {
              setInvoiceUrl(null);
              limpar();
              navigate(`/?presente=novo#mesa`);
            });
          }
        } else if (["refunded", "abandoned", "gateway_down"].includes(data.status)) {
          parar(() => {
            setOrderId(null);
            setInvoiceUrl(null);
            setErro("O pagamento não foi concluído. Dá pra tentar de novo 💛");
          });
        }
      } catch {
        /* rede instável: mantém tentando */
      }
    }, 4000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [orderId, limpar, navigate]);

  const cpfNumeros = cpf.replace(/\D/g, "");
  const cpfOk = cpfNumeros.length === 11 && !/^(\d)\1{10}$/.test(cpfNumeros);
  const itensParaEnvio = () =>
    linhas.map((l) => ({
      giftId: l.gift.id,
      nome: l.gift.nome,
      empresa: l.gift.empresa,
      preco: l.gift.preco,
      quantidade: l.quantidade,
    }));

  const gerarPix = async () => {
    setErro(null);
    setInvoiceUrl(null); // Pix não tem checkout hospedado — não mostrar "reabrir"
    if (!nome.trim()) return setErroNome(true);
    if (!cpfOk) return setErroCpf(true);
    playPop();
    setPixLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ metodo: "pix", nomeRemetente: nome.trim(), cpf: cpfNumeros, mensagem: mensagem.trim(), itens: itensParaEnvio() }),
      });
      const data = await res.json();
      if (!res.ok || !data.pix?.copiaECola) throw new Error();
      setPixData(data.pix);
      setOrderId(data.orderId); // começa a aguardar a confirmação do Pix
    } catch {
      setErro("Não consegui gerar o Pix agora. Confere o CPF e tenta de novo? 💛");
    } finally {
      setPixLoading(false);
    }
  };

  const pagarCartao = async () => {
    setErro(null);
    if (!nome.trim()) return setErroNome(true);
    playPop();
    setCartaoLoading(true);
    // abre a aba JÁ no clique (gesto do usuário) pra não cair no bloqueador de popup.
    // SEM "noopener" aqui: com noopener o window.open devolve null e a gente perde a
    // referência — depois só apontamos essa aba pro checkout do Asaas quando a cobrança sai.
    const aba = window.open("", "_blank");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ metodo: "cartao", nomeRemetente: nome.trim(), cpf: cpfOk ? cpfNumeros : undefined, mensagem: mensagem.trim(), itens: itensParaEnvio() }),
      });
      const data = await res.json();
      if (!res.ok || !data.invoiceUrl) throw new Error();
      // checkout do cartão abre em OUTRA aba; esta tela fica "aguardando pagamento"
      setInvoiceUrl(data.invoiceUrl);
      setOrderId(data.orderId);
      if (aba) {
        aba.opener = null; // corta o vínculo com a nossa página depois de já ter a referência
        aba.location.href = data.invoiceUrl;
      } else {
        window.open(data.invoiceUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      if (aba) aba.close();
      setInvoiceUrl(null);
      setErro("Não consegui abrir o pagamento no cartão. Tenta de novo? 💛");
    } finally {
      setCartaoLoading(false);
    }
  };

  const copiarPix = async () => {
    if (!pixData) return;
    try {
      playPop();
      await navigator.clipboard.writeText(pixData.copiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* ignora */
    }
  };

  // ── carrinho vazio ──
  if (linhas.length === 0) {
    return (
      <main className={styles.naoAchou}>
        <FloatingAsset src="/assets/balao-lilas.png" width={80} duration={5} />
        <h1 className={styles.obrigadoTitulo}>Sua sacola está vazia</h1>
        <p className={styles.obrigadoTexto}>Escolha um ou mais presentes pra Catarina e a Lucia 💛</p>
        <Link to="/#presentes" className={styles.botaoMesa}>Escolher presentes</Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {aguardando && (
        <div className={styles.aguardando} role="status" aria-live="polite">
          <span className={styles.aguardandoDot} />
          <span>aguardando pagamento</span>
          {invoiceUrl && (
            <button
              type="button"
              className={styles.aguardandoLink}
              onClick={() => window.open(invoiceUrl, "_blank", "noopener,noreferrer")}
            >
              reabrir
            </button>
          )}
        </div>
      )}

      <FloatingAsset src="/assets/estrela-1.png" width={36} className={styles.deco1} duration={3} />
      <FloatingAsset src="/assets/nuvem-2.png" width={100} className={styles.deco2} duration={5.5} delay={0.4} />

      <Link to="/#presentes" className={styles.voltar}>← escolher mais</Link>

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
                <button className={styles.remover} onClick={() => { playPop(); remove(l.gift.id); }}>remover</button>
              </div>
              <div className={styles.itemDireita}>
                <div className={styles.stepper}>
                  <button className={styles.stepBtn} aria-label="diminuir" onClick={() => { playPop(); add(l.gift.id, -1); }}>−</button>
                  <span className={styles.stepQtd}>{l.quantidade}</span>
                  <button className={styles.stepBtn} aria-label="aumentar" onClick={() => { playPop(); add(l.gift.id); }}>+</button>
                </div>
                <span className={styles.itemSubtotal}>{brl(l.gift.preco * l.quantidade)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.form}>
          <div className={styles.campo}>
            <label className={styles.campoLabel} htmlFor="nome">De quem são os presentes?</label>
            <input
              id="nome"
              className={`${styles.input} ${erroNome ? styles.inputErro : ""}`}
              placeholder="Ex.: Família Souza"
              value={nome}
              onChange={(e) => { setNome(e.target.value); if (erroNome) setErroNome(false); }}
            />
            {erroNome && <span className={styles.aviso}>Conta pra gente quem está mandando 💛</span>}
          </div>

          <div className={styles.campo}>
            <label className={styles.campoLabel} htmlFor="cpf">Seu CPF <span className={styles.campoHint}>(necessário para o Pix)</span></label>
            <input
              id="cpf"
              inputMode="numeric"
              className={`${styles.input} ${erroCpf ? styles.inputErro : ""}`}
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => { setCpf(e.target.value); if (erroCpf) setErroCpf(false); }}
            />
            {erroCpf && <span className={styles.aviso}>Precisa de um CPF válido pra gerar o Pix 💛</span>}
          </div>

          <div className={styles.campo}>
            <label className={styles.campoLabel} htmlFor="mensagem">Mensagem para as meninas</label>
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
          <span className={styles.totalLabel}>Total · {totalItens} {totalItens === 1 ? "item" : "itens"}</span>
          <span className={styles.totalValor}>{brl(total)}</span>
        </div>

        <div className={styles.metodos}>
          {/* Pix na mesma posição de sempre: mock rosa até gerar, depois o QR do Asaas */}
          <div className={styles.pixCard}>
            {pixData ? (
              <>
                {pixData.qrCodeImage && (
                  <img className={styles.pixQr} src={`data:image/png;base64,${pixData.qrCodeImage}`} alt="QR Code do Pix" />
                )}
                <button className={styles.copiaCola} onClick={copiarPix}>
                  {copiado ? "código copiado! 💛" : "copiar código Pix (copia e cola)"}
                </button>
                <p className={styles.pixAviso}>Assim que o pagamento for confirmado, o presente aparece na mesa 💛</p>
              </>
            ) : (
              <button
                className={styles.pixGerarBox}
                onClick={gerarPix}
                disabled={pixLoading || cartaoLoading || aguardando}
                aria-label="gerar pix"
              >
                <PixSkeleton />
                <span className={styles.pixGerarLabel}>{pixLoading ? "gerando..." : "gerar pix"}</span>
              </button>
            )}
            <p className={styles.recebedor}>{RECEBEDOR}</p>
          </div>

          {!pixData && (
            <button className={styles.linkBtn} onClick={pagarCartao} disabled={pixLoading || cartaoLoading || aguardando}>
              {cartaoLoading ? "abrindo cartão..." : "ou pagar com cartão"}
            </button>
          )}
          {erro && <span className={styles.aviso}>{erro}</span>}
        </div>
      </div>
    </main>
  );
}
