// Estilo comum a todos os assets: adesivo recortado / scrapbook, pastel, fofo,
// SEM sombra, SEM neon, SEM degradê chapado, fundo TRANSPARENTE (PNG alpha).
const BASE =
  "children's storybook sticker, hand-drawn crayon and gouache texture, soft pastel colors " +
  "(cotton-candy pink, butter yellow, soft lilac, mint green, cream beige), flat cute kawaii " +
  "illustration, die-cut sticker with a subtle white paper edge, NO drop shadow, NO neon, " +
  "NO gradient mesh, NO realistic lighting. Isolated on a FULLY TRANSPARENT background (PNG alpha). " +
  "Single centered object, crisp clean edges, high detail.";

export type AssetPrompt = { file: string; prompt: string };

export const ASSET_PROMPTS: AssetPrompt[] = [
  { file: "nuvem-1.png", prompt: `A fluffy rounded white cloud with a tiny pink blush. ${BASE}` },
  { file: "nuvem-2.png", prompt: `A small soft fluffy cloud, slightly different bumpy shape. ${BASE}` },
  { file: "nuvem-3.png", prompt: `A wide long soft cloud. ${BASE}` },
  { file: "arco-iris-1.png", prompt: `A cute pastel rainbow arc ending in a small fluffy cloud at one foot. ${BASE}` },
  { file: "arco-iris-2.png", prompt: `A small pastel rainbow arc with a tiny cloud, mirrored. ${BASE}` },
  { file: "coroa-1.png", prompt: `A small cute golden princess crown with one pink heart gem. ${BASE}` },
  { file: "coroa-2.png", prompt: `A small cute golden princess tiara with one lilac round gem. ${BASE}` },
  { file: "balao-rosa.png", prompt: `A single glossy-free matte pink party balloon with a thin curly string. ${BASE}` },
  { file: "balao-amarelo.png", prompt: `A single matte butter-yellow party balloon with a thin curly string. ${BASE}` },
  { file: "balao-lilas.png", prompt: `A single matte soft-lilac party balloon with a thin curly string. ${BASE}` },
  { file: "estrela-1.png", prompt: `A cute pink four-point sparkle diamond star. ${BASE}` },
  { file: "estrela-2.png", prompt: `A cute soft-lilac four-point sparkle diamond star. ${BASE}` },
  { file: "brilho-1.png", prompt: `A tiny pale-yellow twinkle sparkle, four points. ${BASE}` },
  { file: "confete-1.png", prompt: `A few scattered little paper confetti pieces in pastel pink, yellow and lilac. ${BASE}` },
  { file: "fita-save-the-date.png", prompt: `A cut-paper ribbon banner badge in lilac, with the text "Save the date" written in a small cute serif. ${BASE}` },
  { file: "presente-1.png", prompt: `A cute small wrapped gift box, pink paper with a soft bow on top. ${BASE}` },
  { file: "presente-2.png", prompt: `A cute small wrapped gift box, butter-yellow paper with a soft bow on top. ${BASE}` },
  { file: "presente-3.png", prompt: `A cute small wrapped gift box, soft-lilac paper with a soft bow on top. ${BASE}` },
  { file: "presente-4.png", prompt: `A cute small wrapped gift box, mint-green paper with a soft bow on top. ${BASE}` },
  { file: "presente-5.png", prompt: `A cute tall wrapped gift box, pink and yellow polka dots, with a bow. ${BASE}` },
  { file: "presente-6.png", prompt: `A cute round gift box with a big bow on top, cream-beige paper with pink hearts. ${BASE}` },
];
