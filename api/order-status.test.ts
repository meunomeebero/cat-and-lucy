import { it, expect } from "vitest";
import { getOrderStatus } from "./order-status";

// id fora do formato uuid → null ANTES de tocar o banco (sem DATABASE_URL no teste).
it("rejeita id que não é uuid sem consultar o banco", async () => {
  expect(await getOrderStatus("")).toBeNull();
  expect(await getOrderStatus("../../etc")).toBeNull();
  expect(await getOrderStatus("1")).toBeNull();
  expect(await getOrderStatus("not-a-uuid")).toBeNull();
});
