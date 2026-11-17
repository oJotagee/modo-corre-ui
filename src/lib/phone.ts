const COUNTRY_CODE = '55';

export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, '');

  if ((digits.length === 12 || digits.length === 13) && digits.startsWith(COUNTRY_CODE)) {
    digits = digits.slice(2);
  }

  if (digits.length !== 10 && digits.length !== 11) return null;

  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99 || digits[1] === '0') return null;

  if (digits.length === 11 && digits[2] !== '9') return null;

  return `${COUNTRY_CODE}${digits}`;
}

export function phoneVariants(normalized: string): string[] {
  const ddd = normalized.slice(2, 4);

  const local = normalized.slice(4);

  const variants = new Set([normalized]);

  if (local.length === 9 && local.startsWith('9')) variants.add(`${COUNTRY_CODE}${ddd}${local.slice(1)}`);
  if (local.length === 8 && /^[6-9]/.test(local)) variants.add(`${COUNTRY_CODE}${ddd}9${local}`);

  return [...variants];
}

export function maskPhone(normalized: string): string {
  const ddd = normalized.slice(2, 4);

  const local = normalized.slice(4);

  const last4 = local.slice(-4);

  return local.length === 9 ? `(${ddd}) ${local[0]}****-${last4}` : `(${ddd}) ****-${last4}`;
}

export function formatPhoneInput(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';

  const ddd = digits.slice(0, 2);

  const rest = digits.slice(2);

  const splitAt = rest.length > 8 ? 5 : 4;

  if (rest.length <= splitAt) return `(${ddd}) ${rest}`;

  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}
