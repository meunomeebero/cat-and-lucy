import { render } from "@testing-library/react";
import { GiftModal } from "./GiftModal";

it("mostra o título com o remetente e a lista de itens", () => {
  const { getByText } = render(
    <GiftModal
      gift={{
        id: "1",
        nomeRemetente: "Tia Bia",
        mensagem: "Oi",
        itens: [
          { giftId: "zoologico", nome: "Ida ao Zoológico", preco: 70, quantidade: 2 },
          { giftId: "aquario", nome: "Ida ao Aquário", preco: 120, quantidade: 1 },
        ],
        total: 260,
        criadoEm: 1,
      }}
      onClose={() => {}}
    />,
  );
  expect(getByText(/Presente da Tia Bia/)).toBeInTheDocument();
  expect(getByText(/2× Ida ao Zoológico/)).toBeInTheDocument();
  expect(getByText(/Total:/)).toBeInTheDocument();
});
