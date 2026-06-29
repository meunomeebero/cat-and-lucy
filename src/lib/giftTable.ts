export type SentGift = {
  id: string;
  nomeRemetente: string;
  mensagem: string;
  foto?: string;
  giftId: string;
  giftNome: string;
  criadoEm: number;
};

const KEY = "mesa-de-presentes-v1";

export const SEED_GIFTS: SentGift[] = [
  {
    id: "seed-1",
    nomeRemetente: "Família Oliveira",
    mensagem: "Parabéns, meninas! Muita saúde e alegria pra vocês duas. Com muito carinho.",
    giftId: "ursinho",
    giftNome: "Ursinho de pelúcia",
    criadoEm: 1,
  },
  {
    id: "seed-2",
    nomeRemetente: "Tia Bia",
    mensagem: "Que esse dia seja tão mágico quanto vocês! Mil beijos da titia.",
    giftId: "vestido-princesa",
    giftNome: "Vestido de princesa",
    criadoEm: 2,
  },
  {
    id: "seed-3",
    nomeRemetente: "Pedro e Ana",
    mensagem: "Feliz aniversário! Cresçam com muita luz e histórias lindas.",
    giftId: "livro-historias",
    giftNome: "Livro de histórias",
    criadoEm: 3,
  },
];

let counter = 0;
function genId(): string {
  counter += 1;
  return `g-${Date.now()}-${counter}`;
}

function readStored(): SentGift[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SentGift[]) : [];
  } catch {
    return [];
  }
}

export function getSentGifts(): SentGift[] {
  const stored = readStored();
  return [...stored, ...SEED_GIFTS].sort((a, b) => b.criadoEm - a.criadoEm);
}

export function addSentGift(input: Omit<SentGift, "id" | "criadoEm">): SentGift {
  const novo: SentGift = { ...input, id: genId(), criadoEm: Date.now() };
  const stored = readStored();
  localStorage.setItem(KEY, JSON.stringify([novo, ...stored]));
  return novo;
}
