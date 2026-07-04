// Client da mesa de presentes: fala com a API (/api/gifts), que persiste no Postgres (Neon).
// Um envio (de uma família) tem VÁRIOS itens com quantidade + um total.
export type SubmissionItem = {
  giftId: string;
  nome: string;
  empresa?: string;
  preco: number;
  quantidade: number;
};

export type SentGift = {
  id: string;
  nomeRemetente: string;
  mensagem: string;
  itens: SubmissionItem[];
  total: number;
  criadoEm: number;
};

export type NewGift = Omit<SentGift, "id" | "criadoEm">;

export async function getSentGifts(): Promise<SentGift[]> {
  const res = await fetch("/api/gifts");
  if (!res.ok) throw new Error("Falha ao carregar a mesa de presentes");
  return (await res.json()) as SentGift[];
}

export async function addSentGift(input: NewGift): Promise<SentGift> {
  const res = await fetch("/api/gifts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Falha ao enviar os presentes");
  return (await res.json()) as SentGift;
}
