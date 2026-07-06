import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SaveTheDate } from "../sections/SaveTheDate";
import { GiftList } from "../sections/GiftList";
import { GiftTable } from "../sections/GiftTable";
import { CartBar } from "../components/CartBar";
import { Confetti } from "../components/Confetti";

export default function Home() {
  const [params, setParams] = useSearchParams();
  // captura só na montagem: comemora uma vez, mesmo depois de limpar a URL.
  const [celebrarId] = useState(() => params.get("presente"));
  const celebrar = celebrarId !== null;

  // Chegou pagando: rola até a mesa (fim da página), comemora e tira o ?presente da URL
  // pra um refresh/compartilhamento não replayar o confete.
  useEffect(() => {
    if (!celebrar) return;
    const t = setTimeout(() => {
      document.getElementById("mesa")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    if (params.has("presente")) {
      const p = new URLSearchParams(params);
      p.delete("presente");
      setParams(p, { replace: true });
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrar]);

  return (
    <main>
      <SaveTheDate />
      <GiftList />
      <GiftTable destaqueId={celebrarId ?? undefined} />
      <CartBar />
      {celebrar && <Confetti />}
    </main>
  );
}
