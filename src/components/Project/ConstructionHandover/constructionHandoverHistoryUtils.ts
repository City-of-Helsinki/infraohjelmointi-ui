import { TFunction } from 'i18next';
import { IConstructionHandoverHistoryEntry } from '@/interfaces/constructionHandoverInterfaces';
import { formatBudgetEuro } from '@/utils/constructionHandoverUtils';
import { formatDateToHds } from '@/utils/dates';
import { normalizeHistoryValue } from '@/utils/historyPanelUtils';

const I18N_PREFIX = 'constructionHandoverForm.changeHistory';

// Fields rendered as state "pills" (old → new) instead of a text diff. Status
// transitions are the headline events of a handover's life, so they get pills.
export const PILL_FIELDS = new Set<string>(['status']);

// Date fields the backend serialises as ISO ("2026-07-22"); shown in HDS format.
const DATE_FIELDS = new Set<string>(['constructionStart', 'constructionEnd']);

// Relations the backend resolves to a related row's enum `value`; run through
// the shared `option.<value>` catalogue for a readable, localised label.
const OPTION_FIELDS = new Set<string>(['constructionProcurementMethod']);

// The handover status enum is audited as its raw SCREAMING_SNAKE value; the
// i18n catalogue keys it in camelCase (see constructionHandoverForm.status.*).
const STATUS_I18N_KEY: Record<string, string> = {
  DRAFT: 'draft',
  SUBMITTED_TO_PROGRAMMER: 'submittedToProgrammer',
  SUBMITTED_TO_CONSTRUCTION: 'submittedToConstruction',
  PROJECT_MANAGER_NAMED: 'projectManagerNamed',
  MOVED_TO_CONSTRUCTION_PREPARATION: 'movedToConstructionPreparation',
};

export const historyFieldLabel = (field: string, t: TFunction): string =>
  t(`${I18N_PREFIX}.fields.${field}`, { defaultValue: field });

// The handover feed resolves relations server-side, so values arrive as
// display-ready strings — no id→name lookup is needed. We only localise the
// status/option enums, format dates and money, and pass text through as-is.
export const resolveHistoryValue = (field: string, value: unknown, t: TFunction): string => {
  const raw = normalizeHistoryValue(value);
  if (raw === null) {
    return '';
  }

  if (field === 'status') {
    return t(`constructionHandoverForm.status.${STATUS_I18N_KEY[raw] ?? raw}`, {
      defaultValue: raw,
    });
  }
  if (DATE_FIELDS.has(field)) {
    return formatDateToHds(raw) ?? raw;
  }
  if (field === 'totalCost') {
    return formatBudgetEuro(raw) || raw;
  }
  if (OPTION_FIELDS.has(field)) {
    return t(`option.${raw}`, { defaultValue: raw });
  }
  return raw;
};

// The fields this entry changed, in the backend's stable (sorted) order.
export const changedFieldsOf = (entry: IConstructionHandoverHistoryEntry): Array<string> =>
  entry.changed_fields ?? [];

export type HistoryActionKey = 'created' | 'changedStatus' | 'editedField' | 'editedForm';

// Decide the human phrasing for an entry: created the handover, changed its
// status, edited a single named field, or edited several fields.
export const historyActionOf = (
  entry: IConstructionHandoverHistoryEntry,
): { key: HistoryActionKey; field?: string } => {
  if (entry.operation === 'CREATE') {
    return { key: 'created' };
  }
  const fields = changedFieldsOf(entry);
  if (fields.length > 0 && fields.every((field) => PILL_FIELDS.has(field))) {
    return { key: 'changedStatus' };
  }
  if (fields.length === 1) {
    return { key: 'editedField', field: fields[0] };
  }
  return { key: 'editedForm' };
};
