import { render } from "@testing-library/react";
import { GiftModal } from "./GiftModal";

it("mostra o título com o nome do remetente", () => {
  const { getByText } = render(
    <GiftModal
      gift={{
        id: "1",
        nomeRemetente: "Tia Bia",
        mensagem: "Oi",
        giftId: "ursinho",
        giftNome: "Ursinho de pelúcia",
        criadoEm: 1,
      }}
      onClose={() => {}}
    />,
  );
  expect(getByText(/Presente da Tia Bia/)).toBeInTheDocument();
});
