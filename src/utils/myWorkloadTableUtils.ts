import {
  MyWorkloadPhaseSortValue,
  MyWorkloadSortCompare,
  MyWorkloadSortState,
  MyWorkloadTableRow,
} from '@/interfaces/myWorkloadInterfaces';
import { getMyWorkloadDateTimeValue } from './myWorkloadUtils';

const DATE_COLUMNS = new Set<keyof MyWorkloadTableRow>([
  'planningStart',
  'planningEnd',
  'constructionStart',
  'constructionEnd',
]);
const PHASE_ORDER = [
  'proposal',
  'design',
  'programming',
  'designPlanning',
  'constructionWait',
  'constructionPreparation',
  'construction',
  'warrantyPeriod',
  'completed',
];
const SORTABLE_COLUMN_KEYS = new Set<string>([
  'projectName',
  'description',
  ...DATE_COLUMNS,
  'phase',
  'phaseDetail',
]);

const isPhaseSortValue = (value: unknown): value is MyWorkloadPhaseSortValue =>
  typeof value === 'object' &&
  value !== null &&
  'value' in value &&
  typeof value.value === 'string' &&
  'constructionStart' in value &&
  typeof value.constructionStart === 'string';

const getPhaseRank = (value: string): number => {
  const rank = PHASE_ORDER.indexOf(value);
  return rank === -1 ? PHASE_ORDER.length : rank;
};

export const getMyWorkloadDateSortValues = (rows: MyWorkloadTableRow[]) => {
  const values = new Map<string, number>();
  for (const row of rows) {
    for (const colKey of DATE_COLUMNS) {
      const date = row[colKey];
      if (typeof date === 'string' && !values.has(date)) {
        values.set(date, getMyWorkloadDateTimeValue(date));
      }
    }
  }
  return values;
};

export const createMyWorkloadDateCompare =
  (dateSortValues: ReadonlyMap<string, number>): MyWorkloadSortCompare =>
  (valueA, valueB) => {
    const timeA =
      (typeof valueA === 'string' ? dateSortValues.get(valueA) : undefined) ??
      Number.NEGATIVE_INFINITY;
    const timeB =
      (typeof valueB === 'string' ? dateSortValues.get(valueB) : undefined) ??
      Number.NEGATIVE_INFINITY;
    return timeA < timeB ? -1 : timeA > timeB ? 1 : 0;
  };

export const createMyWorkloadPhaseCompare =
  (compareDates: MyWorkloadSortCompare): MyWorkloadSortCompare =>
  (valueA, valueB) => {
    if (!isPhaseSortValue(valueA) || !isPhaseSortValue(valueB)) {
      return 0;
    }
    return (
      getPhaseRank(valueA.value) - getPhaseRank(valueB.value) ||
      compareDates(valueA.constructionStart, valueB.constructionStart)
    );
  };

const getSortableValue = (
  row: MyWorkloadTableRow,
  colKey: keyof MyWorkloadTableRow,
  dateSortValues: ReadonlyMap<string, number>,
): string | null => {
  if (colKey === 'phase') {
    return row.phase.value.trim() || null;
  }
  if (colKey === 'phaseDetail') {
    return row.phaseDetail.label.trim() || null;
  }
  const value = row[colKey];
  if (DATE_COLUMNS.has(colKey)) {
    const date = String(value ?? '');
    return Number.isFinite(dateSortValues.get(date)) ? date : null;
  }
  return String(value ?? '').trim() || null;
};

export const hasSortableValues = (
  rows: MyWorkloadTableRow[],
  colKey: keyof MyWorkloadTableRow,
  dateSortValues: ReadonlyMap<string, number>,
) => rows.some((row) => getSortableValue(row, colKey, dateSortValues) !== null);

export const isSortableColumnKey = (key: string): key is keyof MyWorkloadTableRow =>
  SORTABLE_COLUMN_KEYS.has(key);

export const sortMyWorkloadRows = (
  rows: MyWorkloadTableRow[],
  sortState: MyWorkloadSortState,
  dateSortValues: ReadonlyMap<string, number>,
  compareDates: MyWorkloadSortCompare,
  comparePhases: MyWorkloadSortCompare,
) => {
  const phaseSortRows = rows.map((row) => ({
    ...row,
    phase: { ...row.phase, constructionStart: row.constructionStart },
  }));
  if (!sortState || !hasSortableValues(rows, sortState.colKey, dateSortValues)) {
    return phaseSortRows;
  }
  const sorted = [...phaseSortRows].sort((rowA, rowB) => {
    const { colKey } = sortState;
    if (colKey === 'phase') {
      return comparePhases(rowA.phase, rowB.phase);
    }
    if (DATE_COLUMNS.has(colKey)) {
      return compareDates(rowA[colKey], rowB[colKey]);
    }
    const valueA = getSortableValue(rowA, colKey, dateSortValues);
    const valueB = getSortableValue(rowB, colKey, dateSortValues);
    return String(valueA ?? '').localeCompare(String(valueB ?? ''), 'fi', {
      sensitivity: 'base',
      ...(colKey === 'phaseDetail' ? {} : { numeric: true }),
    });
  });
  return sortState.order === 'desc' ? sorted.reverse() : sorted;
};
