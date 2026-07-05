import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import CartCheckout from "./CartCheckout";
import { CartProvider } from "../lib/cart";

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderWithCart(cart: Record<string, number>) {
  localStorage.setItem("carrinho-v1", JSON.stringify(cart));
  return render(
    <MemoryRouter>
      <CartProvider>
        <CartCheckout />
      </CartProvider>
    </MemoryRouter>,
  );
}

it("mostra os itens e o total", () => {
  renderWithCart({ zoologico: 2 });
  expect(screen.getByText("Ida ao Zoológico")).toBeInTheDocument();
  expect(screen.getAllByText(/140,00/).length).toBeGreaterThan(0);
});

it("Gerar Pix sem CPF válido → mostra erro e NÃO chama a API", () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  renderWithCart({ zoologico: 1 });
  fireEvent.change(screen.getByPlaceholderText(/Família/i), { target: { value: "Família Souza" } });
  fireEvent.click(screen.getByText("Gerar Pix"));
  expect(screen.getByText(/CPF válido/i)).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("Gerar Pix com CPF → POST /api/checkout (metodo pix) e mostra o QR", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ orderId: "o1", status: "PENDING", pix: { qrCodeImage: "AAAA", copiaECola: "000201...pix" } }),
  });
  vi.stubGlobal("fetch", fetchMock);
  renderWithCart({ zoologico: 1 });
  fireEvent.change(screen.getByPlaceholderText(/Família/i), { target: { value: "Família Souza" } });
  fireEvent.change(screen.getByPlaceholderText(/000\.000/i), { target: { value: "12345678909" } });
  fireEvent.click(screen.getByText("Gerar Pix"));

  expect(await screen.findByText(/Pague com Pix/i)).toBeInTheDocument();
  const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
  expect(fetchMock.mock.calls[0][0]).toBe("/api/checkout");
  expect(body.metodo).toBe("pix");
  expect(body.cpf).toBe("12345678909");
  expect(body.itens[0].giftId).toBe("zoologico");
});

it("carrinho vazio mostra o estado vazio", () => {
  renderWithCart({});
  expect(screen.getByText(/sacola está vazia/i)).toBeInTheDocument();
});
