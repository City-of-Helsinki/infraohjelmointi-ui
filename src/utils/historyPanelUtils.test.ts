import moment from 'moment';
import { TFunction } from 'i18next';
import {
  actorNameOf,
  avatarColor,
  initialsOf,
  normalizeHistoryValue,
  relativeHistoryDateTime,
} from './historyPanelUtils';

// Echo the i18n key so we can assert the catalogue is consulted.
const t = ((key: string) => key) as unknown as TFunction;

const PREFIX = 'someForm.changeHistory';

describe('normalizeHistoryValue', () => {
  it('returns null for null/undefined and the backend "None"/"null" sentinels', () => {
    expect(normalizeHistoryValue(null)).toBeNull();
    expect(normalizeHistoryValue(undefined)).toBeNull();
    expect(normalizeHistoryValue('None')).toBeNull();
    expect(normalizeHistoryValue('null')).toBeNull();
    expect(normalizeHistoryValue('')).toBeNull();
  });

  it('stringifies primitives and objects', () => {
    expect(normalizeHistoryValue('Urakka A')).toBe('Urakka A');
    expect(normalizeHistoryValue(42)).toBe('42');
    expect(normalizeHistoryValue({ a: 1 })).toBe('{"a":1}');
  });
});

describe('relativeHistoryDateTime', () => {
  it('formats a timestamp from today as "today HH:mm" under the given namespace', () => {
    const iso = moment().hour(12).minute(22).second(0).millisecond(0).toISOString();
    const result = relativeHistoryDateTime(iso, t, PREFIX);
    expect(result).toContain(`${PREFIX}.today`);
    expect(result).toContain(moment(iso).format('HH:mm'));
  });

  it('formats a timestamp from yesterday as "yesterday HH:mm"', () => {
    const iso = moment().subtract(1, 'day').hour(13).minute(25).second(0).toISOString();
    expect(relativeHistoryDateTime(iso, t, PREFIX)).toContain(`${PREFIX}.yesterday`);
  });

  it('formats an older timestamp as an absolute date-time', () => {
    expect(relativeHistoryDateTime('2025-03-12T14:08:00', t, PREFIX)).toBe('12.3.2025 14:08');
  });

  it('returns an empty string for a null timestamp', () => {
    expect(relativeHistoryDateTime(null, t, PREFIX)).toBe('');
  });
});

describe('actor helpers', () => {
  it('derives initials, falling back to "?"', () => {
    expect(initialsOf('Anna', 'Hakala')).toBe('AH');
    expect(initialsOf('', '')).toBe('?');
    expect(initialsOf(null, null)).toBe('?');
  });

  it('builds an actor name, falling back when both names are missing', () => {
    expect(actorNameOf({ actor_first_name: 'Anna', actor_last_name: 'Hakala' }, 'X')).toBe(
      'Anna Hakala',
    );
    expect(actorNameOf({ actor_first_name: null, actor_last_name: null }, 'Tuntematon')).toBe(
      'Tuntematon',
    );
  });

  it('returns a stable colour from the palette for a given seed', () => {
    const palette = new Set([
      'var(--color-coat-of-arms)',
      'var(--color-bus)',
      'var(--color-success)',
      'var(--color-gold)',
      'var(--color-suomenlinna)',
      'var(--color-tram)',
      'var(--color-copper)',
      'var(--color-error)',
    ]);
    expect(avatarColor('Anna Hakala')).toBe(avatarColor('Anna Hakala'));
    expect(palette.has(avatarColor('Anna Hakala'))).toBe(true);
  });
});
