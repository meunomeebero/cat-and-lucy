import { describe, it, expect } from "vitest";
import { GIFTS, getGiftById } from "./gifts";

describe("GIFTS", () => {
  it("tem ao menos 6 presentes, todos com id/nome/preco/asset", () => {
    expect(GIFTS.length).toBeGreaterThanOrEqual(6);
    for (const g of GIFTS) {
      expect(g.id).toBeTruthy();
      expect(g.nome).toBeTruthy();
      expect(g.preco).toBeGreaterThan(0);
      expect(g.asset).toMatch(/\/assets\//);
    }
  });

  it("ids sao unicos", () => {
    expect(new Set(GIFTS.map((g) => g.id)).size).toBe(GIFTS.length);
  });

  it("getGiftById acha e retorna undefined pra inexistente", () => {
    expect(getGiftById(GIFTS[0].id)?.id).toBe(GIFTS[0].id);
    expect(getGiftById("nao-existe")).toBeUndefined();
  });
});
