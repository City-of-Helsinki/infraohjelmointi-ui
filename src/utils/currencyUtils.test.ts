import { currencyToRequestValue, formatBudgetEuro, parseCurrency } from './currencyUtils';

describe('currencyUtils', () => {
  it('parses localized currency strings into numbers', () => {
    expect(parseCurrency('1 234,50€')).toBe(1234.5);
    expect(parseCurrency('0,00€')).toBe(0);
    expect(parseCurrency(42.5)).toBe(42.5);
  });

  it('returns null for invalid currency values', () => {
    expect(parseCurrency('not-a-number')).toBeNull();
    expect(parseCurrency(Number.NaN)).toBeNull();
    expect(parseCurrency(null)).toBeNull();
  });

  it('formats parsed values as euro strings', () => {
    expect(formatBudgetEuro('1000,5')).toBe('1 000,50€');
    expect(formatBudgetEuro('0')).toBe('0,00€');
    expect(formatBudgetEuro('')).toBe('');
  });

  it('converts values to request payload format', () => {
    expect(currencyToRequestValue('1 234,5€')).toBe('1234.50');
    expect(currencyToRequestValue(0)).toBe('0.00');
    expect(currencyToRequestValue('')).toBe('');
  });
});