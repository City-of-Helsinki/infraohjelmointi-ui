import { FC, memo, MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import { Button, ButtonVariant, Checkbox, Pagination, Table, type TableProps } from 'hds-react';
import { useTranslation } from 'react-i18next';
import {
  MyWorkloadSortState,
  MyWorkloadTableProps,
  MyWorkloadTableRow,
} from '@/interfaces/myWorkloadInterfaces';
import {
  createMyWorkloadDateCompare,
  createMyWorkloadPhaseCompare,
  getMyWorkloadDateSortValues,
  hasSortableValues,
  isSortableColumnKey,
  sortMyWorkloadRows,
} from '@/utils/myWorkloadTableUtils';
import classes from '../styles.module.css';
import MyWorkloadEditDialog from './MyWorkloadEditDialog';
import WidthFittedTable from './WidthFittedTable';
import { createTableColumns } from './myWorkloadTableColumns';

const ITEMS_PER_PAGE = 10;

const MyWorkloadTable: FC<MyWorkloadTableProps> = ({
  listOfProjects,
  isLoading,
  hasError,
  viewType,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [tableRows, setTableRows] = useState<Array<MyWorkloadTableRow>>(listOfProjects);
  const [prevListOfProjects, setPrevListOfProjects] = useState(listOfProjects);
  const [sortState, setSortState] = useState<MyWorkloadSortState>(null);
  const [tableResetToggle, setTableResetToggle] = useState(false);
  const [fitToWidth, setFitToWidth] = useState(false);
  const [editedProject, setEditedProject] = useState<MyWorkloadTableRow | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  if (prevListOfProjects !== listOfProjects) {
    setPrevListOfProjects(listOfProjects);
    setTableRows(listOfProjects);
    if (listOfProjects.length !== tableRows.length) {
      setPage(0);
    }
  }

  const isEmpty = !isLoading && !hasError && tableRows.length === 0;
  const hasRows = !hasError && tableRows.length > 0;
  const shouldRenderTable = !isLoading && !hasError && hasRows;

  const dateSortValues = useMemo(() => getMyWorkloadDateSortValues(tableRows), [tableRows]);
  const compareDates = useMemo(() => createMyWorkloadDateCompare(dateSortValues), [dateSortValues]);
  const comparePhases = useMemo(() => createMyWorkloadPhaseCompare(compareDates), [compareDates]);
  const sortedRows = useMemo(
    () => sortMyWorkloadRows(tableRows, sortState, dateSortValues, compareDates, comparePhases),
    [tableRows, sortState, dateSortValues, compareDates, comparePhases],
  );

  const pageCount = useMemo(() => Math.ceil(sortedRows.length / ITEMS_PER_PAGE), [sortedRows]);
  const pageHref = useCallback(() => '#', []);

  const availableRowsList = useMemo(() => {
    const startIndex = page * ITEMS_PER_PAGE;
    return sortedRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedRows, page]);

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
      if (!isSortableColumnKey(colKey) || !hasSortableValues(tableRows, colKey, dateSortValues)) {
        return;
      }

      applyHdsSortState();
      setSortState({ colKey, order });
    },
    [tableRows, dateSortValues],
  );

  const handleResetSort = () => {
    setSortState(null);
    setPage(0);
    setTableResetToggle((previous) => !previous);
    titleRef.current?.focus();
  };

  const cols = useMemo(
    () => createTableColumns(viewType, t, setEditedProject, compareDates, comparePhases),
    [viewType, t, setEditedProject, compareDates, comparePhases],
  );

  return (
    <div className={classes.tableContainer} id="my-workload-table-container">
      <h2 ref={titleRef} tabIndex={-1} className={`${classes.sectionTitle} text-heading-m`}>
        {t('myWorkloadView.myWorkload')}
      </h2>
      <div
        className={classes.resetSort}
        style={{ display: sortState && shouldRenderTable ? 'block' : 'none' }}
      >
        <Button type="button" variant={ButtonVariant.Secondary} onClick={handleResetSort}>
          {t('myWorkloadView.table.resetSort')}
        </Button>
      </div>
      {shouldRenderTable && (
        <>
          <div className={classes.fitTableControl}>
            <Checkbox
              id="my-workload-fit-to-width"
              label={t('myWorkloadView.table.fitToWidth')}
              checked={fitToWidth}
              onChange={(event) => setFitToWidth(event.target.checked)}
            />
          </div>
          <WidthFittedTable enabled={fitToWidth}>
            <Table
              key={tableResetToggle ? 'reset-a' : 'reset-b'}
              cols={cols}
              rows={availableRowsList}
              indexKey="id"
              renderIndexCol={false}
              onSort={handleSort}
              initialSortingColumnKey={sortState?.colKey}
              initialSortingOrder={sortState?.order}
            />
          </WidthFittedTable>
        </>
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
