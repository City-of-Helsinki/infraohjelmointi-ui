import { TFunction } from 'i18next';
import {
  MyWorkloadSortCompare,
  MyWorkloadTableColumn,
  MyWorkloadTableRow,
  MyWorkloadViewType,
} from '@/interfaces/myWorkloadInterfaces';
import { formatMyWorkloadDateForDisplay } from '@/utils/myWorkloadUtils';
import MyWorkloadPhaseCell from './MyWorkloadPhaseCell';
import MyWorkloadFunctionsCell from './MyWorkloadFunctionsCell';

export const createTableColumns = (
  viewType: MyWorkloadViewType,
  t: TFunction,
  onEdit: (row: MyWorkloadTableRow) => void,
  compareDates: MyWorkloadSortCompare,
  comparePhases: MyWorkloadSortCompare,
): MyWorkloadTableColumn[] => {
  const dateKeys: Array<'planningStart' | 'planningEnd' | 'constructionStart' | 'constructionEnd'> =
    viewType === 'planning'
      ? ['planningStart', 'planningEnd', 'constructionStart']
      : ['planningEnd', 'constructionStart', 'constructionEnd'];
  const dateColumns: MyWorkloadTableColumn[] = dateKeys.map((key) => ({
    key,
    headerName: t(`myWorkloadView.table.${key}`),
    isSortable: true,
    sortIconType: 'other',
    customSortCompareFunction: compareDates,
    transform: (row: MyWorkloadTableRow) => formatMyWorkloadDateForDisplay(row[key]),
  }));

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
      customSortCompareFunction: comparePhases,
      transform: ({ phase }: MyWorkloadTableRow) => <MyWorkloadPhaseCell phaseInfo={phase} />,
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
      transform: (row: MyWorkloadTableRow) => (
        <MyWorkloadFunctionsCell
          row={row}
          label={t('myWorkloadView.table.modifyInformation')}
          onEdit={onEdit}
        />
      ),
    },
  ];
};
