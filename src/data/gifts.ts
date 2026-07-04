export type Gift = { id: string; nome: string; empresa?: string; preco: number; asset: string };

// Atividades infantis reais em São Paulo (empresa + preço por criança, pesquisados na web).
// Preços são aproximados/promocionais e variam por data/promoção — confira antes.
export const GIFTS: Gift[] = [
  { id: "planetario", nome: "Sessão no Planetário", empresa: "Planetário do Ibirapuera", preco: 18, asset: "/assets/atividade-planetario.png" },
  { id: "catavento", nome: "Museu Catavento", empresa: "Catavento Cultural", preco: 20, asset: "/assets/atividade-catavento.png" },
  { id: "zoologico", nome: "Ida ao Zoológico", empresa: "Zoológico de São Paulo", preco: 70, asset: "/assets/atividade-zoologico.png" },
  { id: "pophaus", nome: "Parque de infláveis", empresa: "PopHaus", preco: 79, asset: "/assets/atividade-pophaus.png" },
  { id: "trampolim", nome: "Parque de trampolim", empresa: "Altitude Park", preco: 80, asset: "/assets/atividade-trampolim.png" },
  { id: "fazendinha", nome: "Dia na fazendinha", empresa: "Mini Fazenda Pet Zoo", preco: 85, asset: "/assets/atividade-fazendinha.png" },
  { id: "escape", nome: "Escape room infantil", empresa: "Escape Junior", preco: 90, asset: "/assets/atividade-escape.png" },
  { id: "aquario", nome: "Ida ao Aquário", empresa: "Aquário de São Paulo", preco: 120, asset: "/assets/atividade-aquario.png" },
  { id: "parque-monica", nome: "Parque da Mônica", empresa: "Shopping SP Market", preco: 185, asset: "/assets/atividade-parque.png" },
  { id: "cooking", nome: "Oficina de culinária", empresa: "Cooking Lab", preco: 220, asset: "/assets/atividade-cooking.png" },
];

export function getGiftById(id: string): Gift | undefined {
  return GIFTS.find((g) => g.id === id);
}
