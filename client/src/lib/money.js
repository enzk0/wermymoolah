export const CURRENCY = 'USD';

const fullFormat = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: CURRENCY,
});

const wholeFormat = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export function formatCents(cents) {
  return fullFormat.format(cents / 100);
}

export function formatCentsShort(cents) {
  return cents % 100 === 0 ? wholeFormat.format(cents / 100) : formatCents(cents);
}

export function parseAmountToCents(text) {
  const cleaned = text
    .trim()
    .replace(/[\s,]/g, '')
    .replace(/^[^\d.-]+/, '');

  if (cleaned === '') return 0;
  if (!/^\d*\.?\d*$/.test(cleaned) || cleaned === '.') return null;

  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;

  return Math.round(value * 100);
}

export function centsToInput(cents) {
  return cents === 0 ? '' : (cents / 100).toFixed(2);
}

export function totalCents(entries) {
  let total = 0;
  for (const entry of entries) {
    total += entry.amountCents;
  }
  return total;
}
