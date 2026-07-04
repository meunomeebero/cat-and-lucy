import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { beforeEach, afterEach, it, expect } from "vitest";
import { CartProvider, useCart } from "./cart";

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

function Probe() {
  const { add, setQtd, remove, totalItens, total, quantidadeDe } = useCart();
  return (
    <div>
      <span data-testid="count">{totalItens}</span>
      <span data-testid="total">{total}</span>
      <span data-testid="qtd-zoo">{quantidadeDe("zoologico")}</span>
      <button onClick={() => add("zoologico")}>add-zoo</button>
      <button onClick={() => add("aquario", 2)}>add-aqua2</button>
      <button onClick={() => setQtd("zoologico", 3)}>set-zoo-3</button>
      <button onClick={() => remove("aquario")}>rm-aqua</button>
    </div>
  );
}

it("add/setQtd/remove atualizam contagem e total (zoo=70, aquário=120)", () => {
  render(
    <CartProvider>
      <Probe />
    </CartProvider>,
  );
  fireEvent.click(screen.getByText("add-zoo")); // zoo x1 = 70
  fireEvent.click(screen.getByText("add-aqua2")); // aquário x2 = 240
  expect(screen.getByTestId("count").textContent).toBe("3");
  expect(screen.getByTestId("total").textContent).toBe("310");

  fireEvent.click(screen.getByText("set-zoo-3")); // zoo x3
  expect(screen.getByTestId("qtd-zoo").textContent).toBe("3");

  fireEvent.click(screen.getByText("rm-aqua")); // remove aquário
  expect(screen.getByTestId("total").textContent).toBe("210"); // zoo 3 x 70
  expect(screen.getByTestId("count").textContent).toBe("3");
});
