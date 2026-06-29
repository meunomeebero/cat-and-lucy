import { render } from "@testing-library/react";
import { PixBox } from "./PixBox";

it("mostra chave, valor e favorecido", () => {
  const { getByText } = render(
    <PixBox
      payload="000201..."
      chave="036.417.452-84"
      valor={80}
      favorecido="Roberto Rocha da Costa Junior"
    />,
  );
  expect(getByText(/036\.417\.452-84/)).toBeInTheDocument();
  expect(getByText(/Roberto Rocha da Costa Junior/)).toBeInTheDocument();
});
