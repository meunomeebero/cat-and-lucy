import { describe, it, expect, vi, afterEach } from "vitest";
import { getSentGifts, addSentGift } from "./giftTable";

afterEach(() => vi.restoreAllMocks());

const sample = {
  id: "1",
  nomeRemetente: "Família Souza",
  mensagem: "parabéns!",
  itens: [{ giftId: "zoologico", nome: "Ida ao Zoológico", preco: 70, quantidade: 2 }],
  total: 140,
  criadoEm: 1,
};

describe("giftTable client (API, multi-item)", () => {
  it("getSentGifts faz GET /api/gifts e retorna a lista", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [sample] });
    vi.stubGlobal("fetch", fetchMock);

    const res = await getSentGifts();
    expect(fetchMock).toHaveBeenCalledWith("/api/gifts");
    expect(res[0].itens[0].quantidade).toBe(2);
    expect(res[0].total).toBe(140);
  });

  it("addSentGift faz POST com itens + total no corpo", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => sample });
    vi.stubGlobal("fetch", fetchMock);

    await addSentGift({
      nomeRemetente: "Família Souza",
      mensagem: "parabéns!",
      itens: [{ giftId: "zoologico", nome: "Ida ao Zoológico", preco: 70, quantidade: 2 }],
      total: 140,
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/gifts", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.itens).toHaveLength(1);
    expect(body.total).toBe(140);
  });

  it("getSentGifts lança erro quando a resposta não é ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(getSentGifts()).rejects.toThrow();
  });
});
