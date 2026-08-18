import { TFunction } from 'i18next';
import { IClass } from '@/interfaces/classInterfaces';
import { IListItem } from '@/interfaces/common';
import { IListState } from '@/reducers/listsSlice';
import { IProjectHistoryEntry } from '@/interfaces/projectInterfaces';
import { normalizeHistoryValue } from '@/utils/historyPanelUtils';

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

export const historyFieldLabelKey = (field: string): string =>
  `projectForm.changeHistory.fields.${field}`;

export const historyFieldLabel = (field: string, t: TFunction): string =>
  t(historyFieldLabelKey(field), {
    defaultValue: t(`projectForm.${field}`, { defaultValue: field }),
  });

// projectClass changes (master/class/subclass) are audited as the related
// class UUID; resolve against the class hierarchy to a readable name.
const CLASS_FIELDS = new Set<string>(['projectClass']);

export const resolveHistoryValue = (
  field: string,
  value: unknown,
  lists: IListState,
  classes: Array<IClass>,
  t: TFunction,
): string => {
  const raw = normalizeHistoryValue(value);
  if (raw === null) {
    return '';
  }

  // Class / subclass: resolve the UUID to the class name.
  if (CLASS_FIELDS.has(field)) {
    return classes.find((item) => item.id === raw)?.name ?? raw;
  }

  // Other relation fields are audited either as the list row's UUID (project
  // form) or directly as its enum value (planning phase menu). Resolve a UUID to
  // its enum value, then translate via the shared `option.<value>` catalogue,
  // falling back to the raw value when there is no matching translation.
  const listKey = RELATION_FIELD_LISTS[field];
  if (listKey) {
    const list = lists[listKey] as Array<IListItem> | undefined;
    const match = Array.isArray(list) ? list.find((item) => item.id === raw) : undefined;
    const optionValue = match?.value ?? raw;
    return t(`option.${optionValue}`, { defaultValue: optionValue });
  }

  return raw;
};

// The raw option key (e.g. "programming") behind a pill value, used to pick the
// matching phase icon. Mirrors resolveHistoryValue's UUID → enum-value step.
export const historyOptionKey = (field: string, value: unknown, lists: IListState): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const raw = String(value);
  const listKey = RELATION_FIELD_LISTS[field];
  const list = listKey ? (lists[listKey] as Array<IListItem> | undefined) : undefined;
  const match = Array.isArray(list) ? list.find((item) => item.id === raw) : undefined;
  return match?.value ?? raw;
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
