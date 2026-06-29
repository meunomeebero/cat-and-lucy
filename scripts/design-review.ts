import { reviewDesign } from "./openrouter.ts";

const imagePath = process.argv[2];
if (!imagePath) {
  console.error(
    "uso: node --env-file=.env --experimental-strip-types scripts/design-review.ts <imagem> [contexto]",
  );
  process.exit(1);
}
const contexto = process.argv.slice(3).join(" ");

const INSTRUCOES =
  "Voce e um diretor de arte avaliando o design de um site de aniversario INFANTIL, " +
  "estilo scrapbook / recorte / adesivo, tons pasteis (rosa, amarelo, bege, lilas, menta), fofo e ludico. " +
  "REGRAS DURAS que NAO podem ser violadas: nada de neon, nada de box-shadow/sombra, nada de degrade (gradient), " +
  "nada de bordas destacadas. Olhe o screenshot e responda em PT-BR, objetivo e pratico: " +
  "(1) nota 0-10 de fofura/coerencia; (2) o que esta bom; (3) lista priorizada de ajustes concretos " +
  "para ficar mais bonito e infantil; (4) violacoes das regras duras, se houver. " +
  (contexto ? "Contexto desta tela: " + contexto : "");

const critica = await reviewDesign(imagePath, INSTRUCOES);
console.log(critica);
