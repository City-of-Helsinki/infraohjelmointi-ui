import { normalizeHkrId } from './usePwLinkConfirmation';

describe('normalizeHkrId', () => {
  it.each([
    ['123', '123'],
    ['0123', '123'],
    [' 0123 ', '123'],
    ['0', '0'],
    ['000', '0'],
    [123, '123'],
    [null, ''],
    [undefined, ''],
    [{}, ''],
    ['12a', '12a'],
    ['-5', '-5'],
  ])('normalizes %p to %p', (value, expected) => {
    expect(normalizeHkrId(value)).toBe(expected);
  });
});
