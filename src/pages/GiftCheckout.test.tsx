import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, it, expect, vi } from "vitest";
import GiftCheckout from "./GiftCheckout";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderCheckout() {
  return render(
    <MemoryRouter initialEntries={["/presente/ursinho"]}>
      <Routes>
        <Route path="/presente/:id" element={<GiftCheckout />} />
      </Routes>
    </MemoryRouter>,
  );
}

it("fluxo: preencher -> concluir -> POST /api/gifts -> agradecimento", async () => {
  const created = {
    id: "1", nomeRemetente: "Vovó Marlene", mensagem: "Da vovó!", giftId: "ursinho",
    giftNome: "Ursinho de pelúcia", criadoEm: 1,
  };
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => created });
  vi.stubGlobal("fetch", fetchMock);

  renderCheckout();
  fireEvent.change(screen.getByPlaceholderText(/Presente da família/i), {
    target: { value: "Vovó Marlene" },
  });
  fireEvent.change(screen.getByPlaceholderText(/carinho/i), {
    target: { value: "Da vovó!" },
  });
  fireEvent.click(screen.getByText("Concluir"));

  expect(await screen.findByText(/Presente enviado/i)).toBeInTheDocument();
  expect(screen.getByText(/Vovó Marlene/)).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith("/api/gifts", expect.objectContaining({ method: "POST" }));
});

it("exige o nome antes de concluir (não chama a API)", () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);

  renderCheckout();
  fireEvent.click(screen.getByText("Concluir"));

  expect(screen.getByText(/quem está mandando/i)).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});
