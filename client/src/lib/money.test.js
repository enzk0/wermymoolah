import { describe, expect, it } from 'vitest';
import { parseAmountToCents } from './money.js';

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
