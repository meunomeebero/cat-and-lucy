import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleWebhookEvent, tokenOk, type WebhookDeps } from "./asaas-webhook";

function makeDeps(over: Partial<WebhookDeps> = {}): WebhookDeps {
  return {
    findOrder: vi.fn(async () => ({ id: "ord-1", asaasId: "pay_1" })),
    verifyCharge: vi.fn(async () => "CONFIRMED"),
    creditOrder: vi.fn(async () => true),
    markOverdue: vi.fn(async () => {}),
    refundOrder: vi.fn(async () => {}),
    ...over,
  };
}

const confirmedEvt = (ref?: string) => ({
  event: "PAYMENT_CONFIRMED",
  payment: { id: "pay_1", externalReference: ref, status: "CONFIRMED" },
});

describe("webhook — isolamento (conta compartilhada)", () => {
  it("ref de OUTRO app (não está na nossa tabela) → 200 ignorado, 0 crédito", async () => {
    const deps = makeDeps({ findOrder: vi.fn(async () => null) });
    const r = await handleWebhookEvent(deps, confirmedEvt("uuid-do-curriculol"));
    expect(r.ignored).toBe("foreign-ref");
    expect(deps.creditOrder).not.toHaveBeenCalled();
  });

  it("sem externalReference → 200 no-op, sem query", async () => {
    const deps = makeDeps();
    const r = await handleWebhookEvent(deps, confirmedEvt(undefined));
    expect(r.ignored).toBe("no-ref");
    expect(deps.findOrder).not.toHaveBeenCalled();
  });

  it("evento de assinatura → ignorado", async () => {
    const deps = makeDeps();
    const r = await handleWebhookEvent(deps, { event: "PAYMENT_CONFIRMED", payment: { subscription: "sub_1" } });
    expect(r.ignored).toBe("subscription");
    expect(deps.findOrder).not.toHaveBeenCalled();
  });
});

describe("webhook — só credita o que o Asaas confirma", () => {
  it("payload 'pago' mas Asaas diz PENDING → não credita", async () => {
    const deps = makeDeps({ verifyCharge: vi.fn(async () => "PENDING") });
    const r = await handleWebhookEvent(deps, confirmedEvt("ord-ref"));
    expect(r.verified).toBe(false);
    expect(deps.creditOrder).not.toHaveBeenCalled();
  });

  it("Asaas confirma → credita", async () => {
    const deps = makeDeps();
    const r = await handleWebhookEvent(deps, confirmedEvt("ord-ref"));
    expect(r.credited).toBe(true);
    expect(deps.creditOrder).toHaveBeenCalledWith("ord-1");
  });
});

describe("webhook — idempotência (reentrega credita 1×)", () => {
  it("mesmo evento 2× → creditOrder credita só na 1ª (CAS)", async () => {
    let creditados = 0;
    const creditOrder = vi.fn(async () => {
      // simula o CAS: só o primeiro vence
      if (creditados === 0) {
        creditados++;
        return true;
      }
      return false;
    });
    const deps = makeDeps({ creditOrder });
    const r1 = await handleWebhookEvent(deps, confirmedEvt("ord-ref"));
    const r2 = await handleWebhookEvent(deps, confirmedEvt("ord-ref"));
    expect(r1.credited).toBe(true);
    expect(r2.credited).toBe(false);
    expect(creditados).toBe(1);
  });
});

describe("webhook — overdue / refund", () => {
  it("PAYMENT_OVERDUE → markOverdue", async () => {
    const deps = makeDeps();
    await handleWebhookEvent(deps, { event: "PAYMENT_OVERDUE", payment: { externalReference: "ord-ref" } });
    expect(deps.markOverdue).toHaveBeenCalledWith("ord-1");
  });
  it("PAYMENT_REFUNDED → refundOrder", async () => {
    const deps = makeDeps();
    await handleWebhookEvent(deps, { event: "PAYMENT_REFUNDED", payment: { externalReference: "ord-ref" } });
    expect(deps.refundOrder).toHaveBeenCalledWith("ord-1");
  });
});

describe("webhook — token", () => {
  beforeEach(() => vi.unstubAllEnvs());
  it("token correto → ok; tamanho errado → false; sem secret → false", () => {
    vi.stubEnv("ASAAS_WEBHOOK_SECRET", "s3cr3t_do_nosso_webhook_2026_x");
    expect(tokenOk("s3cr3t_do_nosso_webhook_2026_x")).toBe(true);
    expect(tokenOk("errado")).toBe(false);
    vi.stubEnv("ASAAS_WEBHOOK_SECRET", "");
    expect(tokenOk("qualquer")).toBe(false);
  });
});
