import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { GIFTS, getGiftById, type Gift } from "../data/gifts";

export type CartLine = { gift: Gift; quantidade: number };

type CartCtx = {
  linhas: CartLine[];
  quantidadeDe: (id: string) => number;
  add: (id: string, delta?: number) => void;
  setQtd: (id: string, q: number) => void;
  remove: (id: string) => void;
  limpar: () => void;
  totalItens: number; // soma das quantidades
  total: number; // soma preço * quantidade
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "carrinho-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(map));
  }, [map]);

  const setQtd = (id: string, q: number) =>
    setMap((m) => {
      const next = { ...m };
      if (q <= 0 || !getGiftById(id)) delete next[id];
      else next[id] = Math.min(q, 99);
      return next;
    });

  const add = (id: string, delta = 1) => setQtd(id, (map[id] ?? 0) + delta);
  const remove = (id: string) => setQtd(id, 0);
  const limpar = () => setMap({});

  // linhas na ordem do catálogo, só as com quantidade > 0
  const linhas: CartLine[] = GIFTS.filter((g) => (map[g.id] ?? 0) > 0).map((g) => ({
    gift: g,
    quantidade: map[g.id],
  }));

  const totalItens = linhas.reduce((s, l) => s + l.quantidade, 0);
  const total = linhas.reduce((s, l) => s + l.quantidade * l.gift.preco, 0);

  return (
    <Ctx.Provider
      value={{ linhas, quantidadeDe: (id) => map[id] ?? 0, add, setQtd, remove, limpar, totalItens, total }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return c;
}
