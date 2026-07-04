import { describe, it, expect } from "vitest";
import { buildChargeBody, CHARGE_DESCRIPTION } from "./checkout";

describe("checkout — builder da cobrança (antifraude / #16)", () => {
  const body = buildChargeBody("cus_123", 450, "ord-uuid-1");

  it("billingType CREDIT_CARD e valor em REAIS (não centavos)", () => {
    expect(body.billingType).toBe("CREDIT_CARD");
    expect(body.value).toBe(450);
  });

  it("NUNCA envia callback.successUrl (derruba cartão sem whitelist)", () => {
    expect("callback" in body).toBe(false);
  });

  it("NÃO envia payload de creditCard (checkout hospedado escolhe parcelas)", () => {
    expect("creditCard" in body).toBe(false);
  });

  it("description nunca contém 'créditos'/'bônus'/'cashback'", () => {
    expect(CHARGE_DESCRIPTION.toLowerCase()).not.toMatch(/crédito|credito|bônus|bonus|cashback/);
    expect(body.description).toBe(CHARGE_DESCRIPTION);
  });

  it("externalReference = id da nossa order (âncora de isolamento)", () => {
    expect(body.externalReference).toBe("ord-uuid-1");
  });

  it("dueDate no formato YYYY-MM-DD", () => {
    expect(body.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
