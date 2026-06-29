export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function sanitize(text: string, max: number): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max)
    .trim();
}

export function buildPixPayload(args: {
  key: string;
  amount: number;
  merchantName: string;
  merchantCity: string;
  txid?: string;
}): string {
  const { key, amount, merchantName, merchantCity, txid = "***" } = args;

  const merchantAccount = field("26", field("00", "br.gov.bcb.pix") + field("01", key));
  const additional = field("62", field("05", sanitize(txid, 25) || "***"));

  const payload =
    field("00", "01") +
    merchantAccount +
    field("52", "0000") +
    field("53", "986") +
    field("54", amount.toFixed(2)) +
    field("58", "BR") +
    field("59", sanitize(merchantName, 25)) +
    field("60", sanitize(merchantCity, 15)) +
    additional +
    "6304";

  return payload + crc16(payload);
}
