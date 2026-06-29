import { render } from "@testing-library/react";
import { FloatingAsset } from "./FloatingAsset";

it("renderiza a imagem do asset", () => {
  const { getByRole } = render(
    <FloatingAsset src="/assets/nuvem-1.png" alt="nuvem" width={100} />,
  );
  expect(getByRole("img")).toHaveAttribute("src", "/assets/nuvem-1.png");
});
