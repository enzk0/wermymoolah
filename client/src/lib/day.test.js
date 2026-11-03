import { describe, expect, it } from 'vitest';
import { addDays } from './day.js';

describe('addDays', () => {
  it('should return the same day if amount is 0', () => {
    expect(addDays('2025-01-01', 0)).toBe('2025-01-01');
  });

  it('should return the next day if amount is positive', () => {
    expect(addDays('2025-01-01', 3)).toBe('2025-01-04');
  });

  it('is able to handle negative amounts', () => {
    expect(addDays('2025-01-10', -3)).toBe('2025-01-07');
  });

  it('is able to handle the next month', () => {
    expect(addDays('2025-01-31', 3)).toBe('2025-02-03');
  });

  it('is able to handle the next year', () => {
    expect(addDays('2025-12-31', 3)).toBe('2026-01-03');
  });

  it('is able to handle a leap year', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('throws if no amount is given', () => {
    expect(() => addDays('2025-01-01')).toThrow('amount must be an integer');
  });

  it('throws if no key is given', () => {
    expect(() => addDays(undefined, 1)).toThrow();
  });
});
