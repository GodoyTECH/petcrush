export const SALE_BLOCK_MESSAGE = "❌ O PetCrushes não permite venda. Use Match ou Doação/Adoção.";
const SALE_BLOCKED_REGEX = /(?:\bR\$\b|\$|\bvendo\b|\bvenda\b|\bvalor\b|\bpreço\b|\bpreco\b|\bpagamento\b|\bpix\b|\bcobro\b|\bcobrando\b|\bfrete\b|\bparcelado\b|\bentrego\b|\baceito\b|\busd\b|\bcash\b)/i;

export function hasSaleContent(value) {
  if (!value) return false;
  if (typeof value === "string") return SALE_BLOCKED_REGEX.test(value);
  if (Array.isArray(value)) return value.some(hasSaleContent);
  if (typeof value === "object") return Object.values(value).some(hasSaleContent);
  return false;
}
