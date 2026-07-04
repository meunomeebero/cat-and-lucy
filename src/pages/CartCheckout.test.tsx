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

it("mostra os itens do carrinho, o total, e conclui com POST /api/gifts", async () => {
  const created = { id: "1", nomeRemetente: "Família Souza", mensagem: "", itens: [], total: 140, criadoEm: 1 };
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => created });
  vi.stubGlobal("fetch", fetchMock);

  renderWithCart({ zoologico: 2 });

  expect(screen.getByText("Ida ao Zoológico")).toBeInTheDocument();
  // 140,00 aparece em subtotal, total e Pix
  expect(screen.getAllByText(/140,00/).length).toBeGreaterThan(0); // total 2 x 70

  fireEvent.change(screen.getByPlaceholderText(/Família/i), { target: { value: "Família Souza" } });
  fireEvent.click(screen.getByText("Enviar presentes"));

  expect(await screen.findByText(/Presentes enviados/i)).toBeInTheDocument();
  const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
  expect(body.itens[0].giftId).toBe("zoologico");
  expect(body.itens[0].quantidade).toBe(2);
  expect(body.total).toBe(140);
});

it("carrinho vazio mostra o estado vazio", () => {
  renderWithCart({});
  expect(screen.getByText(/sacola está vazia/i)).toBeInTheDocument();
});
