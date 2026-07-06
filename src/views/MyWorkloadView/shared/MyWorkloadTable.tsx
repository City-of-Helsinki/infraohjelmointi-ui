import { FC, memo, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Pagination, Table } from 'hds-react';
import type { TableProps } from 'hds-react';
import { IconAngleRight } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import classes from '../styles.module.css';
import MyWorkloadEditDialog from './MyWorkloadEditDialog';

interface MyWorkloadTableProps {
  listOfProjects: MyWorkloadTableRow[];
  isLoading: boolean;
  hasError: boolean;
}

const ITEMS_PER_PAGE = 10;

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

const MyWorkloadTable: FC<MyWorkloadTableProps> = ({ listOfProjects, isLoading, hasError }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [tableRows, setTableRows] = useState<Array<MyWorkloadTableRow>>([]);
  const [editedProject, setEditedProject] = useState<MyWorkloadTableRow | null>(null);

  const isEmpty = !isLoading && !hasError && tableRows.length === 0;
  const hasRows = !isLoading && !hasError && tableRows.length > 0;

  useEffect(() => {
    setTableRows(listOfProjects);
  }, [listOfProjects]);

  const pageCount = useMemo(() => Math.ceil(tableRows.length / ITEMS_PER_PAGE), [tableRows]);
  const pageHref = useCallback(() => '#', []);

  const availableRowsList = useMemo(() => {
    const startIndex = page * ITEMS_PER_PAGE;
    return tableRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [tableRows, page]);

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

  const cols: TableProps['cols'] = [
    {
      key: 'projectName',
      headerName: t('myWorkloadView.table.projectName'),
      isSortable: true,
    },
    {
      key: 'description',
      headerName: t('myWorkloadView.table.description'),
      isSortable: true,
    },
    {
      key: 'planningStart',
      headerName: t('myWorkloadView.table.planningStart'),
      isSortable: true,
    },
    {
      key: 'planningEnd',
      headerName: t('myWorkloadView.table.planningEnd'),
      isSortable: true,
    },
    {
      key: 'phase',
      headerName: t('myWorkloadView.table.phase'),
      isSortable: true,
      transform: ({ phase, phaseValue }: MyWorkloadTableRow) => (
        <div className={classes.phaseCellAlignRight}>
          <span className={`${classes.phasePill} ${phaseClassByValue(phaseValue)}`}>{phase}</span>
        </div>
      ),
    },
    {
      key: 'functions',
      headerName: t('myWorkloadView.table.functions'),
      isSortable: true,
      transform: (row: MyWorkloadTableRow) => (
        <button
          type="button"
          className={classes.modifyInformationButton}
          onClick={() => setEditedProject(row)}
        >
          <span>{t('myWorkloadView.table.modifyInformation')}</span>
          <IconAngleRight aria-hidden="true" />
        </button>
      ),
    },
  ];

  return (
    <>
      <div className={classes.tableContainer} id="my-workload-table-container">
        <h2 className={`${classes.sectionTitle} text-heading-m`}>
          {t('myWorkloadView.myWorkload')}
        </h2>
        {hasRows && <Table cols={cols} rows={availableRowsList} indexKey="id" renderIndexCol={false} />}
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
          onClose={() => setEditedProject(null)}
          onSave={handleProjectSaved}
        />
      </div>
    </>
  );
};

export default memo(MyWorkloadTable);
