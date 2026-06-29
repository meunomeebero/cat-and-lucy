import { describe, it, expect } from "vitest";
import { crc16, buildPixPayload } from "./pix";

describe("crc16", () => {
  it("bate o vetor canonico CRC16-CCITT-FALSE de '123456789' = 0x29B1", () => {
    expect(crc16("123456789")).toBe("29B1");
  });
});

describe("buildPixPayload", () => {
  const payload = buildPixPayload({
    key: "03641745284",
    amount: 30,
    merchantName: "Roberto Rocha da Costa Junior",
    merchantCity: "SAO JOSE CAMPOS",
    txid: "PRESENTE01",
  });

  it("comeca com o Payload Format Indicator", () => {
    expect(payload.startsWith("000201")).toBe(true);
  });

  it("inclui o GUI do pix e a chave", () => {
    expect(payload).toContain("br.gov.bcb.pix");
    expect(payload).toContain("03641745284");
  });

  it("inclui o valor formatado com 2 casas (campo 54, len 05)", () => {
    expect(payload).toContain("5405" + "30.00");
  });

  it("termina com CRC valido (recalcular o que precede '6304' bate)", () => {
    const semCrc = payload.slice(0, -4);
    expect(semCrc.endsWith("6304")).toBe(true);
    expect(crc16(semCrc)).toBe(payload.slice(-4));
  });
});
