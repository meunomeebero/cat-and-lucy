import { describe, it, expect } from "vitest";
import { buildChargeBody, CHARGE_DESCRIPTION, cpfValido } from "./checkout";

describe("checkout — builder da cobrança (antifraude / #16)", () => {
  const card = buildChargeBody("cus_123", 450, "ord-uuid-1", "CREDIT_CARD");
  const pix = buildChargeBody("cus_123", 70, "ord-uuid-2", "PIX");

  it("valor em REAIS (não centavos) e billingType certo", () => {
    expect(card.billingType).toBe("CREDIT_CARD");
    expect(card.value).toBe(450);
    expect(pix.billingType).toBe("PIX");
    expect(pix.value).toBe(70);
  });

  it("NUNCA envia callback.successUrl nem payload de creditCard", () => {
    expect("callback" in card).toBe(false);
    expect("creditCard" in card).toBe(false);
  });

  it("description nunca contém 'créditos'/'bônus'/'cashback'", () => {
    expect(CHARGE_DESCRIPTION.toLowerCase()).not.toMatch(/crédito|credito|bônus|bonus|cashback/);
    expect(card.description).toBe(CHARGE_DESCRIPTION);
  });

  it("externalReference = id da nossa order; dueDate YYYY-MM-DD", () => {
    expect(card.externalReference).toBe("ord-uuid-1");
    expect(card.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("checkout — validação de CPF (obrigatório no Pix)", () => {
  it("aceita 11 dígitos válidos, rejeita curto/repetido/vazio", () => {
    expect(cpfValido("529.982.247-25")).toBe(true);
    expect(cpfValido("52998224725")).toBe(true);
    expect(cpfValido("111.111.111-11")).toBe(false); // repetido
    expect(cpfValido("123")).toBe(false);
    expect(cpfValido(undefined)).toBe(false);
  });
});
