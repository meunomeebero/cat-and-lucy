import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, afterEach, it, expect } from "vitest";
import GiftCheckout from "./GiftCheckout";
import { GiftTable } from "../sections/GiftTable";
import { getSentGifts } from "../lib/giftTable";

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

it("fluxo completo: preencher checkout -> concluir -> persiste e aparece na mesa", () => {
  render(
    <MemoryRouter initialEntries={["/presente/ursinho"]}>
      <Routes>
        <Route path="/presente/:id" element={<GiftCheckout />} />
      </Routes>
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByPlaceholderText(/Presente da família/i), {
    target: { value: "Vovó Marlene" },
  });
  fireEvent.change(screen.getByPlaceholderText(/carinho/i), {
    target: { value: "Da vovó com amor!" },
  });
  fireEvent.click(screen.getByText("Concluir"));

  // tela de agradecimento
  expect(screen.getByText(/Presente enviado/i)).toBeInTheDocument();
  expect(screen.getByText(/Vovó Marlene/)).toBeInTheDocument();

  // persistiu no localStorage
  expect(getSentGifts().some((g) => g.nomeRemetente === "Vovó Marlene")).toBe(true);

  // e aparece na mesa de presentes ao montar
  cleanup();
  render(
    <MemoryRouter>
      <GiftTable />
    </MemoryRouter>,
  );
  expect(screen.getByText("Vovó Marlene")).toBeInTheDocument();
});

it("exige o nome antes de concluir", () => {
  render(
    <MemoryRouter initialEntries={["/presente/ursinho"]}>
      <Routes>
        <Route path="/presente/:id" element={<GiftCheckout />} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByText("Concluir"));
  expect(screen.getByText(/quem está mandando/i)).toBeInTheDocument();
  expect(screen.queryByText(/Presente enviado/i)).toBeNull();
});
