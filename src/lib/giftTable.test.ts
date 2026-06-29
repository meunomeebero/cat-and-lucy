import { describe, it, expect, vi, afterEach } from "vitest";
import { getSentGifts, addSentGift } from "./giftTable";

afterEach(() => vi.restoreAllMocks());

describe("giftTable client (API)", () => {
  it("getSentGifts faz GET /api/gifts e retorna a lista", async () => {
    const data = [
      { id: "1", nomeRemetente: "A", mensagem: "", giftId: "x", giftNome: "X", criadoEm: 1 },
    ];
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => data });
    vi.stubGlobal("fetch", fetchMock);

    const res = await getSentGifts();
    expect(fetchMock).toHaveBeenCalledWith("/api/gifts");
    expect(res).toEqual(data);
  });

  it("addSentGift faz POST /api/gifts com o corpo certo", async () => {
    const created = {
      id: "2", nomeRemetente: "B", mensagem: "oi", giftId: "ursinho", giftNome: "Ursinho", criadoEm: 2,
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => created });
    vi.stubGlobal("fetch", fetchMock);

    const res = await addSentGift({ nomeRemetente: "B", mensagem: "oi", giftId: "ursinho", giftNome: "Ursinho" });
    expect(fetchMock).toHaveBeenCalledWith("/api/gifts", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.nomeRemetente).toBe("B");
    expect(res).toEqual(created);
  });

  it("getSentGifts lança erro quando a resposta não é ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(getSentGifts()).rejects.toThrow();
  });
});
