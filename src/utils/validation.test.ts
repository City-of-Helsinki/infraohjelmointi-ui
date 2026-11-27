import { TFunction } from 'i18next';
import { validateNumericString } from './validation';

const t = ((key: string) => key) as unknown as TFunction<'translation'>;

describe('validateNumericString', () => {
  const { pattern } = validateNumericString(t);

  it('uses the whole number message', () => {
    expect(pattern.message).toBe('validation.wholeNumber');
  });

  it.each(['0', '7', '2025', '01234'])('accepts %s', (value) => {
    expect(pattern.value.test(value)).toBe(true);
  });

  it.each(['abc', '20a5', '2025abc', '-1', '1.5', '1,5', '1e3', ' 2025', '2025 ', '+1', ''])(
    'rejects "%s"',
    (value) => {
      expect(pattern.value.test(value)).toBe(false);
    },
  );
});
