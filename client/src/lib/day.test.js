import { describe, expect, it } from 'vitest';
import { addDays, addMonths } from './day.js';

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

describe('addMonths', () => {
  it('throws if no amount is given', () => {
    expect(() => addMonths({ 2025: '01' }, undefined)).toThrow();
  });
  it.each([undefined, null, '2025-01', { year: 2025 }, { year: 2025, month: 13 }])(
    'throws for invalid input %o',
    (input) => {
      expect(() => addMonths(input, 1)).toThrow(TypeError);
    },
  );
  it('adds months within a year', () => {
    expect(addMonths({ year: 2025, month: 3 }, 2)).toEqual({ year: 2025, month: 5 });
  });

  it('rolls over into the next year', () => {
    expect(addMonths({ year: 2025, month: 12 }, 1)).toEqual({ year: 2026, month: 1 });
  });

  it('rolls back into the previous year', () => {
    expect(addMonths({ year: 2025, month: 1 }, -1)).toEqual({ year: 2024, month: 12 });
  });
});
