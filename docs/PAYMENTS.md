# Pagamentos (Asaas) — cartão parcelado

Integração do gateway **Asaas** para pagamento no **cartão de crédito parcelado**, ao lado do
Pix manual instantâneo que já existia. Usa a **mesma conta Asaas da BEROLAB LTDA**
(CNPJ 61.026.871/0001-79), **compartilhada** com Curriculol, Breolab e Bewrite — por isso
**isolamento entre apps é o requisito nº 1**.

## Fluxos

- **Pix (instantâneo, sem taxa):** favorecido = CPF do Roberto. Ao "Já paguei no Pix",
  `POST /api/gifts` cria o presente na mesa na hora (sem validação — é para amigos/família).
- **Cartão (parcelado, via Asaas → BEROLAB):** "Pagar no cartão" → `POST /api/checkout` cria
  uma `order` (pending) + cobrança `CREDIT_CARD` → redireciona pro **checkout hospedado do
  Asaas** (a pessoa escolhe as parcelas lá) → **webhook** confirma → a order vira `confirmed`
  e materializa um presente na mesa.

## Isolamento (conta compartilhada) — o que impede quebrar os apps irmãos

- `externalReference` = **UUID puro** (o `orders.id`). A coluna `orders.external_reference` é
  `text`, então qualquer ref que chegue (uuid, prefixado, lixo) é comparada por igualdade de
  texto → **nunca dá 22P02**. Um UUID puro também não quebra o `WHERE id=ref` (coluna uuid) dos
  irmãos. Escolha deliberada em vez do prefixo `catlucy:` para não arriscar o Breolab/Bewrite.
- **Webhook** (`api/asaas-webhook.ts`): ref ausente OU não encontrado na NOSSA tabela → HTTP
  **200 no-op antes de qualquer efeito**. Eventos de Curriculol/Breolab/Bewrite caem aqui.
  Token do header por `timingSafeEqual`. **SEMPRE 200** (mesmo em erro) pra o Asaas não marcar
  o webhook como `interrupted`.
- Antes de creditar, **re-verifica o status na API do Asaas** (`getChargeStatus`) — nunca
  confia no payload. Só credita se `CONFIRMED/RECEIVED/RECEIVED_IN_CASH`.
- **Idempotência:** CAS `pending→confirmed` (só o 1º vence e materializa o presente);
  `orders.asaas_id`/`external_reference` únicos.
- **Reconciliação** (`api/reconcile.ts`, Vercel Cron 3h da manhã): varre `CONFIRMED` **e**
  `RECEIVED`, credita as NOSSAS orders que faltaram (hard-filtra pela presença na tabela), e
  reativa nosso webhook se o Asaas o pausou (`interrupted`).

## Antifraude / #16

- `description` = **"Catarina e Lucia - Presente"** (proibido "créditos"/"bônus"/"cashback").
- **Sem** `callback.successUrl` no cartão (domínio não-whitelisted derruba 100% dos cartões).
- Exibe **"Recebedor: BEROLAB LTDA · CNPJ 61.026.871/0001-79"** no botão de cartão.

## Variáveis de ambiente (na Vercel, do projeto cat-and-lucy)

| Var | O quê |
|---|---|
| `ASAAS_API_KEY` | key de produção (`$aact_prod_...`, **sem** barra de escape) |
| `ASAAS_BASE_URL` | `https://api.asaas.com/v3` |
| `ASAAS_WEBHOOK_SECRET` | token do NOSSO webhook (o mesmo usado no cadastro) |
| `CRON_SECRET` | protege `/api/reconcile` (a Vercel manda `Authorization: Bearer <CRON_SECRET>`) |

`.env` local (gitignored) tem os mesmos. Nunca commitar.

## Go-live (ordem importa)

1. Deploy do código (feito).
2. **Você:** setar as 4 vars acima nas Environment Variables da Vercel e **redeploy**.
3. **Registrar o webhook** via API (`POST /webhooks`, `authToken` = `ASAAS_WEBHOOK_SECRET`,
   url `https://cat-and-lucy.vercel.app/api/asaas-webhook`, os 4 eventos) — só depois do passo 2,
   senão o Asaas manda evento de produção pra um endpoint que valida contra o secret errado.
4. Teste real de R$1 no cartão → confere que aparece na mesa.
5. (Opcional) whitelist do domínio em *Minha Conta > Informações* pra ligar o auto-redirect.

## Testes (critérios de aceite)

`api/asaas-webhook.test.ts` + `api/checkout.test.ts`: ref de outro app → 200 sem crédito; sem
ref → no-op; payload "pago" mas Asaas PENDING → não credita; reentrega credita 1×; overdue/
refund; `description` sem "créditos"; cartão sem `callback.successUrl`; valor em reais.
