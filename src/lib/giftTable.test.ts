import { describe, it, expect, beforeEach } from "vitest";
import { getSentGifts, addSentGift, SEED_GIFTS } from "./giftTable";

beforeEach(() => localStorage.clear());

describe("giftTable", () => {
  it("sem nada salvo, retorna so as seeds", () => {
    expect(getSentGifts().length).toBe(SEED_GIFTS.length);
  });

  it("addSentGift adiciona e aparece no topo", () => {
    const novo = addSentGift({
      nomeRemetente: "Família Souza",
      mensagem: "Parabéns!",
      giftId: "ursinho",
      giftNome: "Ursinho de pelúcia",
    });
    const lista = getSentGifts();
    expect(lista.length).toBe(SEED_GIFTS.length + 1);
    expect(lista[0].id).toBe(novo.id);
    expect(lista[0].nomeRemetente).toBe("Família Souza");
  });

  it("persiste entre chamadas (mesmo localStorage)", () => {
    addSentGift({ nomeRemetente: "A", mensagem: "", giftId: "x", giftNome: "X" });
    addSentGift({ nomeRemetente: "B", mensagem: "", giftId: "y", giftNome: "Y" });
    expect(getSentGifts().length).toBe(SEED_GIFTS.length + 2);
  });

  it("gera ids unicos mesmo em chamadas rapidas", () => {
    const a = addSentGift({ nomeRemetente: "A", mensagem: "", giftId: "x", giftNome: "X" });
    const b = addSentGift({ nomeRemetente: "B", mensagem: "", giftId: "y", giftNome: "Y" });
    expect(a.id).not.toBe(b.id);
  });
});
