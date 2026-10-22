import moment from 'moment';
import { TFunction } from 'i18next';

// Shared building blocks for the change-history side panels (project form and
// construction handover). These are the field-agnostic pieces both feeds have
// in common; the domain-specific value resolution lives in each feature's own
// `*HistoryUtils` module.

export const NO_PREVIOUS_VALUE = '—';

// The backend stringifies an absent relation as "None" (and may send "null"),
// so treat those as "no value" and let the panel render the em dash instead.
const isEmptyHistoryValue = (raw: string): boolean =>
  raw === '' || raw === 'None' || raw === 'null' || raw === 'undefined';

// Normalise a raw audit value to a display string, or `null` when it represents
// "no value" (null/undefined or one of the backend sentinels above). Object
// values are stringified so relation payloads still show something readable.
export const normalizeHistoryValue = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const raw =
    typeof value === 'object' ? JSON.stringify(value) : String(value as string | number | boolean);
  return isEmptyHistoryValue(raw) ? null : raw;
};

// Format an audit timestamp the way the design shows it: "tänään HH:mm" /
// "eilen HH:mm" for the last two days, otherwise "D.M.YYYY HH:mm". The
// today/yesterday labels are read from the caller's i18n namespace.
export const relativeHistoryDateTime = (
  iso: string | null,
  t: TFunction,
  i18nPrefix: string,
): string => {
  if (!iso) {
    return '';
  }
  const m = moment(iso);
  if (!m.isValid()) {
    return iso;
  }
  const time = m.format('HH:mm');
  if (m.isSame(moment(), 'day')) {
    const today = t(`${i18nPrefix}.today`);
    return `${today} ${time}`;
  }
  if (m.isSame(moment().subtract(1, 'day'), 'day')) {
    const yesterday = t(`${i18nPrefix}.yesterday`);
    return `${yesterday} ${time}`;
  }
  return m.format('D.M.YYYY HH:mm');
};

const AVATAR_COLORS = [
  'var(--color-coat-of-arms)',
  'var(--color-bus)',
  'var(--color-success)',
  'var(--color-gold)',
  'var(--color-suomenlinna)',
  'var(--color-tram)',
  'var(--color-copper)',
  'var(--color-error)',
];

// Pick a stable avatar colour from a seed (actor id or name) so the same actor
// always gets the same colour across a session.
export const avatarColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + (seed.codePointAt(i) ?? 0)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const initialsOf = (first?: string | null, last?: string | null): string => {
  const f = (first ?? '').trim();
  const l = (last ?? '').trim();
  const initials = `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
  return initials || '?';
};

// The subset of a history entry the shared helpers need to name the actor.
export interface IHistoryActor {
  actor_first_name?: string | null;
  actor_last_name?: string | null;
}

export const actorNameOf = (entry: IHistoryActor, fallback: string): string => {
  const name = `${entry.actor_first_name ?? ''} ${entry.actor_last_name ?? ''}`.trim();
  return name || fallback;
};
