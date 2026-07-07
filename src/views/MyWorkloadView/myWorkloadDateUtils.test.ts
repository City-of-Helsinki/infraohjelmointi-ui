import {
  normalizeMyWorkloadDate,
  formatMyWorkloadDateForDisplay,
  getMyWorkloadDateTimeValue,
} from './myWorkloadDateUtils';

describe('myWorkloadDateUtils', () => {
  it('normalizes valid dates from all supported input formats', () => {
    expect(normalizeMyWorkloadDate('01.02.2026')).toBe('01.02.2026');
    expect(normalizeMyWorkloadDate('1.2.2026')).toBe('01.02.2026');
    expect(normalizeMyWorkloadDate('2026-02-01')).toBe('01.02.2026');
  });

  it('formats display dates without leading zeros', () => {
    expect(formatMyWorkloadDateForDisplay('01.02.2026')).toBe('1.2.2026');
    expect(formatMyWorkloadDateForDisplay('2026-12-09')).toBe('9.12.2026');
  });

  it('returns comparable time values for date sorting', () => {
    const jan = getMyWorkloadDateTimeValue('01.01.2026');
    const feb = getMyWorkloadDateTimeValue('01.02.2026');

    expect(feb).toBeGreaterThan(jan);
    expect(getMyWorkloadDateTimeValue('31-12-2026')).toBe(Number.NEGATIVE_INFINITY);
  });

  it('returns empty string for invalid, null and empty values', () => {
    expect(normalizeMyWorkloadDate('31-12-2026')).toBe('');
    expect(formatMyWorkloadDateForDisplay('31-12-2026')).toBe('');
    expect(normalizeMyWorkloadDate('')).toBe('');
    expect(normalizeMyWorkloadDate(null)).toBe('');
    expect(normalizeMyWorkloadDate(undefined)).toBe('');
  });

  it('trims extra whitespace in valid values before parsing', () => {
    expect(normalizeMyWorkloadDate('  1. 2.2026  ')).toBe('01.02.2026');
  });
});
