const BRL_INPUT_REGEX = /^(-?)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/;

export function parseBRLToCents(input: string): number | null {
  const cleaned = input.replace(/R\$/gi, '').replace(/[\s ]/g, '');

  const match = BRL_INPUT_REGEX.exec(cleaned);
  if (!match) return null;

  const [, sign, integerPart, decimalPart = ''] = match;

  const cents = Number(integerPart.replace(/\./g, '')) * 100 + Number(decimalPart.padEnd(2, '0'));

  if (!Number.isSafeInteger(cents)) return null;

  return sign === '-' ? -cents : cents;
}

const WHOLE = new Intl.NumberFormat('pt-BR');

/** Formata centavos inteiros em reais sem divisão em ponto flutuante, preservando todo valor seguro (até MAX_SAFE_INTEGER). */
export function formatCents(cents: number): string {
  const rounded = Math.round(cents);

  const absolute = BigInt(Math.abs(rounded));

  const whole = WHOLE.format(absolute / BigInt(100));

  const fraction = String(absolute % BigInt(100)).padStart(2, '0');

  return `${rounded < 0 ? '-' : ''}R$\u00a0${whole},${fraction}`;
}

export function formatSignedCents(cents: number): string {
  if (cents === 0) return formatCents(0);

  const formatted = formatCents(Math.abs(cents));

  return cents > 0 ? `+${formatted}` : `−${formatted}`;
}

export function maskBRLInput(raw: string): string {
  const digits = raw
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .slice(0, 11);

  if (!digits) return '';

  return (Number(digits) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function centsToInput(cents: number): string {
  return maskBRLInput(String(cents));
}
