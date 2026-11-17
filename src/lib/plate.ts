export const PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

const OLD_PLATE_REGEX = /^[A-Z]{3}[0-9]{4}$/;

export function normalizePlate(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidPlate(plate: string): boolean {
  return PLATE_REGEX.test(plate);
}

export function formatPlate(plate: string): string {
  const normalized = normalizePlate(plate);

  return OLD_PLATE_REGEX.test(normalized) ? `${normalized.slice(0, 3)}-${normalized.slice(3)}` : normalized;
}
