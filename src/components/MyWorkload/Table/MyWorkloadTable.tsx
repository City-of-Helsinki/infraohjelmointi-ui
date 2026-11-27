import { FC, memo, MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Pagination,
  Select,
  Table,
  type TableProps,
} from 'hds-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/common';
import { selectProjectPhases } from '@/reducers/listsSlice';
import { translateOption } from '@/utils/optionTranslation';
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
const EMPTY_GROUP_NAMES: ReadonlyMap<string, string> = new Map();

const MyWorkloadTable: FC<MyWorkloadTableProps> = ({
  listOfProjects,
  groupNames = EMPTY_GROUP_NAMES,
  isLoading,
  hasError,
  viewType,
}) => {
  const { t } = useTranslation();
  const phases = useAppSelector(selectProjectPhases);
  const [page, setPage] = useState(0);
  const [selectedPhaseIds, setSelectedPhaseIds] = useState<string[]>([]);
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

  const phaseOptions = useMemo(
    () => phases.map((phase) => ({ value: phase.id, label: translateOption(t, phase.value) })),
    [phases, t],
  );
  const filteredRows = useMemo(
    () =>
      selectedPhaseIds.length === 0
        ? tableRows
        : tableRows.filter((row) => selectedPhaseIds.includes(row.phase.id)),
    [tableRows, selectedPhaseIds],
  );
  const isEmpty = !isLoading && !hasError && tableRows.length === 0;
  const hasNoMatches = !isLoading && !hasError && tableRows.length > 0 && filteredRows.length === 0;
  const hasRows = !hasError && filteredRows.length > 0;
  const shouldRenderTable = !isLoading && !hasError && hasRows;

  const rowsWithGroupNames = useMemo(
    () =>
      filteredRows.map((row) => ({
        ...row,
        groupName: row.projectGroup ? (groupNames.get(row.projectGroup) ?? '') : '',
      })),
    [filteredRows, groupNames],
  );
  const dateSortValues = useMemo(() => getMyWorkloadDateSortValues(filteredRows), [filteredRows]);
  const compareDates = useMemo(() => createMyWorkloadDateCompare(dateSortValues), [dateSortValues]);
  const comparePhases = useMemo(() => createMyWorkloadPhaseCompare(compareDates), [compareDates]);
  const sortedRows = useMemo(
    () =>
      sortMyWorkloadRows(
        rowsWithGroupNames,
        sortState,
        dateSortValues,
        compareDates,
        comparePhases,
      ),
    [rowsWithGroupNames, sortState, dateSortValues, compareDates, comparePhases],
  );

  const pageCount = useMemo(() => Math.ceil(sortedRows.length / ITEMS_PER_PAGE), [sortedRows]);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const pageHref = useCallback(() => '#', []);

  const availableRowsList = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    return sortedRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedRows, currentPage]);

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
      if (
        !isSortableColumnKey(colKey) ||
        !hasSortableValues(rowsWithGroupNames, colKey, dateSortValues)
      ) {
        return;
      }

      applyHdsSortState();
      setSortState({ colKey, order });
    },
    [rowsWithGroupNames, dateSortValues],
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
      {!isLoading && !hasError && (
        <div className={classes.phaseFilter}>
          <Select
            id="my-workload-phase-filter"
            multiSelect
            clearable
            options={phaseOptions}
            value={selectedPhaseIds}
            onChange={(selectedOptions = []) => {
              setSelectedPhaseIds(selectedOptions.map((option) => option.value));
              setPage(0);
            }}
            texts={{
              label: t('myWorkloadView.table.phaseFilter'),
              placeholder: t('myWorkloadView.table.phaseFilterPlaceholder'),
              clearButtonAriaLabel_one: t('myWorkloadView.table.clearPhaseFilter'),
              clearButtonAriaLabel_multiple: t('myWorkloadView.table.clearPhaseFilter'),
              tagRemoveSelectionAriaLabel: `${t('myWorkloadView.table.removePhaseFilter')} {{label}}`,
            }}
          />
        </div>
      )}
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
      {hasNoMatches && (
        <p className={classes.emptyStateText}>{t('myWorkloadView.table.noPhaseMatches')}</p>
      )}
      {hasError && <p className={classes.emptyStateText}>{t('appDataError')}</p>}
      {hasRows && pageCount > 1 && (
        <div className="custom-pagination" data-testid="my-workload-pagination-container">
          <Pagination
            data-testid="my-workload-pagination"
            language="fi"
            onChange={handlePageChange}
            pageCount={pageCount}
            pageHref={pageHref}
            pageIndex={currentPage}
            paginationAriaLabel="My workload pagination"
            siblingCount={2}
          />
        </div>
      )}

      <MyWorkloadEditDialog
        isOpen={editedProject !== null}
        project={editedProject}
        groupName={
          editedProject?.projectGroup ? groupNames.get(editedProject.projectGroup) : undefined
        }
        viewType={viewType}
        onClose={() => setEditedProject(null)}
        onSave={handleProjectSaved}
      />
    </div>
  );
};

export default memo(MyWorkloadTable);
