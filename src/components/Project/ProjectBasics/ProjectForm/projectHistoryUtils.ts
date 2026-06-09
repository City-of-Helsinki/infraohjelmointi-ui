import { IListItem } from '@/interfaces/common';
import { IListState } from '@/reducers/listsSlice';
import { IProjectHistoryEntry } from '@/interfaces/projectInterfaces';

// Financial figures are stored keyed by calendar year ("2026"); form-field
// changes are keyed by field name. The form-level panel only shows the latter —
// the per-year figures live in the planning view history.
export const isYearKey = (key: string): boolean => /^\d{4}$/.test(key);

// Relation fields are audited as the related row's UUID. Map each to the lists
// slice array that resolves that UUID back to a human-readable value, so the
// panel can show "Ohjelmointi" rather than a raw id.
const RELATION_FIELD_LISTS: Partial<Record<string, keyof IListState>> = {
  phase: 'phases',
  phaseDetail: 'projectPhaseDetails',
  category: 'categories',
  constructionProcurementMethod: 'constructionProcurementMethods',
  staraProcurementReason: 'staraProcurementReasons',
  type: 'types',
  typeQualifier: 'typeQualifiers',
  projectQualityLevel: 'projectQualityLevels',
  planningPhase: 'planningPhases',
  constructionPhase: 'constructionPhases',
};

// Fields rendered as state "pills" (old → new) instead of a text diff.
export const PILL_FIELDS = new Set<string>(['phase', 'phaseDetail']);

export const resolveHistoryValue = (
  field: string,
  value: unknown,
  lists: IListState,
): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const raw = typeof value === 'object' ? JSON.stringify(value) : String(value);

  const listKey = RELATION_FIELD_LISTS[field];
  if (listKey) {
    const list = lists[listKey] as Array<IListItem> | undefined;
    const match = Array.isArray(list) ? list.find((item) => item.id === raw) : undefined;
    if (match?.value) {
      return match.value;
    }
  }
  return raw;
};

// The non-financial fields this entry changed, in a stable order.
export const formFieldsOf = (entry: IProjectHistoryEntry): Array<string> =>
  (entry.changed_fields ?? []).filter((field) => !isYearKey(field));

export type HistoryActionKey =
  | 'created'
  | 'deleted'
  | 'changedPhase'
  | 'editedField'
  | 'editedForm';

// Decide the human phrasing for an entry: created / deleted the project, changed
// its phase, edited a single named field, or edited the form (several fields).
export const historyActionOf = (
  entry: IProjectHistoryEntry,
): { key: HistoryActionKey; field?: string } => {
  if (entry.operation === 'CREATE') {
    return { key: 'created' };
  }
  if (entry.operation === 'DELETE') {
    return { key: 'deleted' };
  }
  const fields = formFieldsOf(entry);
  if (fields.length > 0 && fields.every((field) => PILL_FIELDS.has(field))) {
    return { key: 'changedPhase' };
  }
  if (fields.length === 1) {
    return { key: 'editedField', field: fields[0] };
  }
  return { key: 'editedForm' };
};

// Deterministic avatar background so the same actor keeps the same colour.
const AVATAR_COLORS = [
  '#9b3074', // coat-of-arms / plum
  '#0072c6', // bus / blue
  '#00a393', // success / teal
  '#c2a251', // gold
  '#e07799', // pink
  '#7a51c2', // purple
  '#1a7a4c', // green
  '#bd2719', // brick
];

export const avatarColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const initialsOf = (first?: string | null, last?: string | null): string => {
  const f = (first ?? '').trim();
  const l = (last ?? '').trim();
  const initials = `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
  return initials || '?';
};

export const actorNameOf = (
  entry: IProjectHistoryEntry,
  fallback: string,
): string => {
  const name = `${entry.actor_first_name ?? ''} ${entry.actor_last_name ?? ''}`.trim();
  return name || fallback;
};
