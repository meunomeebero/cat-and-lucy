// Client da mesa de presentes: fala com a API serverless (/api/gifts), que persiste
// no Postgres (Neon). Sem mocks, sem localStorage — compartilhado entre todos.
export type SentGift = {
  id: string;
  nomeRemetente: string;
  mensagem: string;
  giftId: string;
  giftNome: string;
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
  if (!res.ok) throw new Error("Falha ao enviar o presente");
  return (await res.json()) as SentGift;
}
