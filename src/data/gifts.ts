export type Gift = { id: string; nome: string; preco: number; asset: string };

export const GIFTS: Gift[] = [
  { id: "lapis-de-cor", nome: "Caixa de lápis de cor", preco: 30, asset: "/assets/presente-1.png" },
  { id: "livro-historias", nome: "Livro de histórias", preco: 45, asset: "/assets/presente-2.png" },
  { id: "kit-massinha", nome: "Kit de massinha", preco: 50, asset: "/assets/presente-3.png" },
  { id: "ursinho", nome: "Ursinho de pelúcia", preco: 80, asset: "/assets/presente-4.png" },
  { id: "vestido-princesa", nome: "Vestido de princesa", preco: 120, asset: "/assets/presente-5.png" },
  { id: "bicicleta", nome: "Bicicleta", preco: 250, asset: "/assets/presente-6.png" },
];

export function getGiftById(id: string): Gift | undefined {
  return GIFTS.find((g) => g.id === id);
}
