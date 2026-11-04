import { describe, expect, it } from 'vitest';
import { parseAmountToCents, totalCents } from './money.js';

describe('parseAmountToCents', () => {
  it('turns pesos into whole cents', () => {
    expect(parseAmountToCents('125.50')).toBe(12550);
  });

  it('ignores thousands separators and a leading currency sign', () => {
    expect(parseAmountToCents('₱1,234.56')).toBe(123456);
  });

  it('treats an empty box as zero', () => {
    expect(parseAmountToCents('   ')).toBe(0);
  });

  it('returns null for text that is not a number', () => {
    expect(parseAmountToCents('12abc')).toBeNull();
    expect(parseAmountToCents('.')).toBeNull();
  });
});

describe('totalCents', () => {
  it('sums amountCents', () => {
    expect(totalCents([{ amountCents: 250 }, { amountCents: -100 }])).toBe(150);
  });

  it('returns 0 for an empty array', () => {
    expect(totalCents([])).toBe(0);
  });

  it('ignores items without an integer amountCents', () => {
    expect(totalCents([{ amountCents: 250 }, { foo: 1 }, null, { amountCents: '5' }])).toBe(250);
  });

  it.each([undefined, null, { amountCents: 250 }, 'abc'])('throws for non-array %o', (input) => {
    expect(() => totalCents(input)).toThrow(TypeError);
  });
});
