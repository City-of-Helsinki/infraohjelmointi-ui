import { FC, memo, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Pagination, Table } from 'hds-react';
import type { TableProps } from 'hds-react';
import { IconAngleRight } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';
import {
  MyWorkloadTableRow,
  MyWorkloadViewType,
  PhaseInfo,
} from '@/interfaces/myWorkloadInterfaces';
import { formatMyWorkloadDateForDisplay } from '@/utils/myWorkloadUtils';
import { isBefore } from '@/utils/dates';
import classes from '../styles.module.css';
import MyWorkloadEditDialog from './MyWorkloadEditDialog';

interface MyWorkloadTableProps {
  listOfProjects: MyWorkloadTableRow[];
  isLoading: boolean;
  hasError: boolean;
  viewType: MyWorkloadViewType;
}

const ITEMS_PER_PAGE = 10;
const DATE_COLUMNS = new Set<keyof MyWorkloadTableRow>([
  'planningStart',
  'planningEnd',
  'constructionStart',
  'constructionEnd',
]);
const LABEL_SORT_COLUMNS = new Set<keyof MyWorkloadTableRow>(['phase', 'phaseDetail']);
const SORTABLE_COLUMN_KEYS = new Set<string>([
  'projectName',
  'description',
  'planningStart',
  'planningEnd',
  'constructionStart',
  'constructionEnd',
  'phase',
  'phaseDetail',
]);

type SortState = {
  colKey: keyof MyWorkloadTableRow;
  order: 'asc' | 'desc';
} | null;

const phaseClassByValue = (phaseValue: string): string => {
  const normalizedValue = phaseValue.toLowerCase();

  const phaseClassMap: Record<string, string> = {
    proposal: classes.phasePillProposal,
    design: classes.phasePillDesign,
    programming: classes.phasePillProgramming,
    draftinitiation: classes.phasePillDraftInitiation,
    draftapproval: classes.phasePillDraftApproval,
    constructionplan: classes.phasePillConstructionPlan,
    constructionwait: classes.phasePillConstructionWait,
    construction: classes.phasePillConstruction,
    constructionpreparation: classes.phasePillConstructionPreparation,
    warrantyperiod: classes.phasePillWarranty,
    completed: classes.phasePillCompleted,
    suspended: classes.phasePillSuspended,
  };

  return phaseClassMap[normalizedValue] ?? classes.phasePillDefault;
};

interface PhaseCellProps {
  phaseInfo: PhaseInfo;
}

const PhaseCell: FC<PhaseCellProps> = ({ phaseInfo }) => (
  <div className={classes.phaseCellAlignRight}>
    <span className={`${classes.phasePill} ${phaseClassByValue(phaseInfo.value)}`}>
      {phaseInfo.label}
    </span>
  </div>
);

interface FunctionsCellProps {
  row: MyWorkloadTableRow;
  label: string;
  onEdit: (row: MyWorkloadTableRow) => void;
}

const FunctionsCell: FC<FunctionsCellProps> = ({ row, label, onEdit }) => (
  <button type="button" className={classes.modifyInformationButton} onClick={() => onEdit(row)}>
    <span>{label}</span>
    <IconAngleRight aria-hidden="true" />
  </button>
);

type TranslateFunction = ReturnType<typeof useTranslation>['t'];

const getSortableValue = (
  row: MyWorkloadTableRow,
  colKey: keyof MyWorkloadTableRow,
): string | null => {
  if (colKey === 'phase') {
    const label = row.phase.label.trim();
    return label || null;
  }

  if (colKey === 'phaseDetail') {
    const label = row.phaseDetail.label.trim();
    return label || null;
  }

  const value = row[colKey];

  if (DATE_COLUMNS.has(colKey)) {
    const date = String(value ?? '');
    return formatMyWorkloadDateForDisplay(date) ? date : null;
  }

  const stringValue = String(value ?? '').trim();
  return stringValue || null;
};

const hasSortableValues = (rows: MyWorkloadTableRow[], colKey: keyof MyWorkloadTableRow) =>
  rows.some((row) => getSortableValue(row, colKey) !== null);

const isSortableColumnKey = (key: string): key is keyof MyWorkloadTableRow =>
  SORTABLE_COLUMN_KEYS.has(key);

const transformPhase = ({ phase }: MyWorkloadTableRow) => <PhaseCell phaseInfo={phase} />;

const renderFunctionsCell = (
  row: MyWorkloadTableRow,
  label: string,
  onEdit: (row: MyWorkloadTableRow) => void,
) => <FunctionsCell row={row} label={label} onEdit={onEdit} />;

const createTableColumns = (
  viewType: MyWorkloadViewType,
  t: TranslateFunction,
  onEdit: (row: MyWorkloadTableRow) => void,
): TableProps['cols'] => {
  const dateColumns: TableProps['cols'] =
    viewType === 'planning'
      ? [
          {
            key: 'planningStart',
            headerName: t('myWorkloadView.table.planningStart'),
            isSortable: true,
            sortIconType: 'other',
            transform: (row: MyWorkloadTableRow) =>
              formatMyWorkloadDateForDisplay(row.planningStart),
          },
          {
            key: 'planningEnd',
            headerName: t('myWorkloadView.table.planningEnd'),
            isSortable: true,
            sortIconType: 'other',
            transform: (row: MyWorkloadTableRow) => formatMyWorkloadDateForDisplay(row.planningEnd),
          },
        ]
      : [
          {
            key: 'constructionStart',
            headerName: t('myWorkloadView.table.constructionStart'),
            isSortable: true,
            sortIconType: 'other',
            transform: (row: MyWorkloadTableRow) =>
              formatMyWorkloadDateForDisplay(row.constructionStart),
          },
          {
            key: 'constructionEnd',
            headerName: t('myWorkloadView.table.constructionEnd'),
            isSortable: true,
            sortIconType: 'other',
            transform: (row: MyWorkloadTableRow) =>
              formatMyWorkloadDateForDisplay(row.constructionEnd),
          },
        ];
  return [
    {
      key: 'projectName',
      headerName: t('myWorkloadView.table.projectName'),
      isSortable: true,
      sortIconType: 'other',
    },
    {
      key: 'description',
      headerName: t('myWorkloadView.table.description'),
      isSortable: true,
      sortIconType: 'other',
    },
    ...dateColumns,
    {
      key: 'phase',
      headerName: t('myWorkloadView.table.phase'),
      isSortable: true,
      sortIconType: 'other',
      transform: transformPhase,
    },
    {
      key: 'phaseDetail',
      headerName: t('projectForm.phaseDetail'),
      isSortable: true,
      sortIconType: 'other',
      transform: (row: MyWorkloadTableRow) => row.phaseDetail.label,
    },
    {
      key: 'functions',
      headerName: t('myWorkloadView.table.functions'),
      transform: (row: MyWorkloadTableRow) =>
        renderFunctionsCell(row, t('myWorkloadView.table.modifyInformation'), onEdit),
    },
  ];
};

const MyWorkloadTable: FC<MyWorkloadTableProps> = ({
  listOfProjects,
  isLoading,
  hasError,
  viewType,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [tableRows, setTableRows] = useState<Array<MyWorkloadTableRow>>([]);
  const [sortState, setSortState] = useState<SortState>(null);
  const [editedProject, setEditedProject] = useState<MyWorkloadTableRow | null>(null);

  const isEmpty = !isLoading && !hasError && tableRows.length === 0;
  const hasRows = !hasError && tableRows.length > 0;
  const shouldRenderTable = !isLoading && !hasError && hasRows;

  useEffect(() => {
    setTableRows(listOfProjects);
  }, [listOfProjects]);

  const sortedRows = useMemo(() => {
    if (!sortState || !hasSortableValues(tableRows, sortState.colKey)) {
      return tableRows;
    }

    const sorted = [...tableRows].sort((rowA, rowB) => {
      const { colKey } = sortState;
      const valueA = getSortableValue(rowA, colKey);
      const valueB = getSortableValue(rowB, colKey);

      if (LABEL_SORT_COLUMNS.has(colKey)) {
        return String(valueA ?? '').localeCompare(String(valueB ?? ''), 'fi', {
          sensitivity: 'base',
        });
      }

      if (DATE_COLUMNS.has(colKey)) {
        if (!valueA && !valueB) {
          return 0;
        }

        if (!valueA || isBefore(valueA, valueB)) {
          return -1;
        }

        if (!valueB || isBefore(valueB, valueA)) {
          return 1;
        }

        return 0;
      }

      return String(valueA ?? '').localeCompare(String(valueB ?? ''), 'fi', {
        sensitivity: 'base',
        numeric: true,
      });
    });

    return sortState.order === 'desc' ? sorted.reverse() : sorted;
  }, [sortState, tableRows]);

  const pageCount = useMemo(() => Math.ceil(sortedRows.length / ITEMS_PER_PAGE), [sortedRows]);
  const pageHref = useCallback(() => '#', []);

  const availableRowsList = useMemo(() => {
    const startIndex = page * ITEMS_PER_PAGE;
    return sortedRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedRows, page]);

  useEffect(() => {
    setPage(0);
  }, [tableRows.length]);

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>, selectedPage: number) => {
      event.preventDefault();
      setPage(selectedPage);
    },
    [],
  );

  const handleProjectSaved = useCallback((updatedRow: MyWorkloadTableRow) => {
    setTableRows((prevRows) =>
      prevRows.map((row) => (row.id === updatedRow.id ? updatedRow : row)),
    );
  }, []);

  const handleSort = useCallback<NonNullable<TableProps['onSort']>>(
    (order, colKey, applyHdsSortState) => {
      if (!isSortableColumnKey(colKey) || !hasSortableValues(tableRows, colKey)) {
        return;
      }

      applyHdsSortState();
      setSortState({ colKey, order });
    },
    [tableRows],
  );

  const cols = useMemo(
    () => createTableColumns(viewType, t, setEditedProject),
    [viewType, t, setEditedProject],
  );

  return (
    <div className={classes.tableContainer} id="my-workload-table-container">
      <h2 className={`${classes.sectionTitle} text-heading-m`}>{t('myWorkloadView.myWorkload')}</h2>
      {shouldRenderTable && (
        <Table
          cols={cols}
          rows={availableRowsList}
          indexKey="id"
          renderIndexCol={false}
          onSort={handleSort}
          initialSortingColumnKey={sortState?.colKey}
          initialSortingOrder={sortState?.order}
        />
      )}
      {isEmpty && <p className={classes.emptyStateText}>{t('myWorkloadView.table.emptyText')}</p>}
      {hasError && <p className={classes.emptyStateText}>{t('appDataError')}</p>}
      {hasRows && pageCount > 1 && (
        <div className="custom-pagination" data-testid="my-workload-pagination-container">
          <Pagination
            data-testid="my-workload-pagination"
            language="fi"
            onChange={handlePageChange}
            pageCount={pageCount}
            pageHref={pageHref}
            pageIndex={page}
            paginationAriaLabel="My workload pagination"
            siblingCount={2}
          />
        </div>
      )}

      <MyWorkloadEditDialog
        isOpen={editedProject !== null}
        project={editedProject}
        viewType={viewType}
        onClose={() => setEditedProject(null)}
        onSave={handleProjectSaved}
      />
    </div>
  );
};

export default memo(MyWorkloadTable);
