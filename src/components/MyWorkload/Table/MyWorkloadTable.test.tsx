import mockI18next from '@/mocks/mockI18next';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import MyWorkloadTable from './MyWorkloadTable';

jest.mock('react-i18next', () => mockI18next());
let consoleErrorSpy: jest.SpyInstance;

jest.mock('./MyWorkloadEditDialog', () => ({
  __esModule: true,
  default: ({
    isOpen,
    project,
    onSave,
  }: {
    isOpen: boolean;
    project: MyWorkloadTableRow | null;
    onSave: (row: MyWorkloadTableRow) => void;
  }) => (
    <div data-testid="mock-edit-dialog">
      {isOpen ? `open:${project?.projectName}` : 'closed'}
      <button
        type="button"
        onClick={() =>
          project &&
          onSave({
            ...project,
            projectName: `${project.projectName} (saved)`,
          })
        }
      >
        trigger-save
      </button>
    </div>
  ),
}));

const makeRow = (index: number): MyWorkloadTableRow => ({
  id: `project-${index}`,
  projectName: `Project ${index}`,
  description: `Description ${index}`,
  planningStart: '01.01.2026',
  planningEnd: '31.12.2026',
  presenceStart: '01.01.2026',
  presenceEnd: '31.12.2026',
  visibilityStart: '01.01.2026',
  visibilityEnd: '31.12.2026',
  constructionStart: '01.01.2027',
  constructionEnd: '31.12.2027',
  planningCostForecast: '100',
  planningPhaseId: 'planning-phase-id',
  planningWorkQuantity: '10',
  constructionCostForecast: '200',
  constructionPhaseId: 'construction-phase-id',
  constructionWorkQuantity: '20',
  phase: {
    id: 'phase-id',
    label: 'option.design',
    value: 'design',
  },
  phaseDetail: {
    id: '',
    label: '',
    value: '',
  },
  functions: 'myWorkloadView.table.modifyInformation',
  budget: '',
  constructionProcurementMethod: undefined,
});

const makeDateSortRow = (index: number, planningStart: string): MyWorkloadTableRow => ({
  ...makeRow(index),
  planningStart,
  planningEnd: planningStart,
});

const makePhaseSortRow = (
  index: number,
  phaseLabel: string,
  phaseDetailLabel: string,
): MyWorkloadTableRow => ({
  ...makeRow(index),
  projectName: `Sort project ${index}`,
  phase: {
    id: `phase-${index}`,
    label: phaseLabel,
    value: `phase-${index}`,
  },
  phaseDetail: {
    id: `phase-detail-${index}`,
    label: phaseDetailLabel,
    value: `phase-detail-${index}`,
  },
});

describe('MyWorkloadTable', () => {
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
      const firstArg = String(args[0] ?? '');
      if (firstArg.includes('Could not parse CSS stylesheet')) {
        return;
      }
      // eslint-disable-next-line no-console
      console.warn(...args);
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders empty state text when there are no rows', () => {
    const { getByText } = render(
      <MyWorkloadTable
        listOfProjects={[]}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    expect(getByText('myWorkloadView.table.emptyText')).toBeInTheDocument();
  });

  it('renders app data error state when request fails', () => {
    const { getByText } = render(
      <MyWorkloadTable listOfProjects={[]} isLoading={false} hasError={true} viewType="planning" />,
    );

    expect(getByText('appDataError')).toBeInTheDocument();
  });

  it('hides custom loading content and empty text while rows are loading', () => {
    const { getByText, queryByText } = render(
      <MyWorkloadTable listOfProjects={[]} isLoading={true} hasError={false} viewType="planning" />,
    );

    expect(getByText('myWorkloadView.myWorkload')).toBeInTheDocument();
    expect(queryByText('myWorkloadView.table.loading')).toBeNull();
    expect(queryByText('myWorkloadView.table.emptyText')).toBeNull();
  });

  it('hides table rows while loading even when previous rows exist', () => {
    const { queryByText } = render(
      <MyWorkloadTable
        listOfProjects={[makeRow(1)]}
        isLoading={true}
        hasError={false}
        viewType="planning"
      />,
    );

    expect(queryByText('Project 1')).toBeNull();
  });

  it('opens edit dialog for selected row when modify button is clicked', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByTestId } = render(
      <MyWorkloadTable
        listOfProjects={[makeRow(1), makeRow(2)]}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: /myWorkloadView.table.modifyInformation/i })[0],
      ).toBeInTheDocument();
    });

    await user.click(
      getAllByRole('button', { name: /myWorkloadView.table.modifyInformation/i })[1],
    );

    expect(getByTestId('mock-edit-dialog')).toHaveTextContent('open:Project 2');
  });

  it('updates table row when dialog calls onSave with edited project', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByRole, queryByText } = render(
      <MyWorkloadTable
        listOfProjects={[makeRow(1)]}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: /myWorkloadView.table.modifyInformation/i })[0],
      ).toBeInTheDocument();
    });

    await user.click(
      getAllByRole('button', { name: /myWorkloadView.table.modifyInformation/i })[0],
    );
    await user.click(getByRole('button', { name: 'trigger-save' }));

    expect(queryByText('Project 1 (saved)')).toBeInTheDocument();
  });

  it('renders pagination and allows moving to next page', async () => {
    const user = userEvent.setup();
    const rows = Array.from({ length: 11 }, (_, i) => makeRow(i + 1));
    const { getByTestId, queryByText } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    const paginationContainer = getByTestId('my-workload-pagination-container');
    const pageTwoButton = within(paginationContainer).getByRole('link', { name: 'Sivu 2' });

    expect(queryByText('Project 1')).toBeInTheDocument();
    expect(queryByText('Project 11')).not.toBeInTheDocument();

    await user.click(pageTwoButton);

    await waitFor(() => {
      expect(queryByText('Project 11')).toBeInTheDocument();
    });
  });

  it('does not render sorting control for the functions column', async () => {
    const { getAllByRole, queryByTestId } = render(
      <MyWorkloadTable
        listOfProjects={[makeRow(1)]}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    await waitFor(() => {
      expect(
        getAllByRole('button', { name: /myWorkloadView.table.modifyInformation/i })[0],
      ).toBeInTheDocument();
    });

    expect(queryByTestId('hds-table-sorting-header-functions')).not.toBeInTheDocument();
  });

  it('sorts full dataset by date and keeps sorting when changing pages', async () => {
    const user = userEvent.setup();
    const rows = [
      makeDateSortRow(1, '10.01.2026'),
      makeDateSortRow(2, '10.02.2026'),
      makeDateSortRow(3, '10.03.2026'),
      makeDateSortRow(4, '10.04.2026'),
      makeDateSortRow(5, '10.05.2026'),
      makeDateSortRow(6, '10.06.2026'),
      makeDateSortRow(7, '10.07.2026'),
      makeDateSortRow(8, '10.08.2026'),
      makeDateSortRow(9, '10.09.2026'),
      makeDateSortRow(10, '10.10.2026'),
      makeDateSortRow(11, '10.11.2026'),
      makeDateSortRow(12, '10.12.2026'),
    ];

    const { getByTestId, queryByText } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    const planningStartSortButton = getByTestId('hds-table-sorting-header-planningStart');
    await user.click(planningStartSortButton);

    expect(queryByText('AÖ')).not.toBeInTheDocument();
    expect(queryByText('ÖA')).not.toBeInTheDocument();

    await user.click(planningStartSortButton);

    await waitFor(() => {
      expect(queryByText('Project 12')).toBeInTheDocument();
      expect(queryByText('Project 2')).not.toBeInTheDocument();
    });

    const paginationContainer = getByTestId('my-workload-pagination-container');
    const pageTwoButton = within(paginationContainer).getByRole('link', { name: 'Sivu 2' });
    await user.click(pageTwoButton);

    await waitFor(() => {
      expect(queryByText('Project 2')).toBeInTheDocument();
      expect(queryByText('Project 12')).not.toBeInTheDocument();
    });
  });

  it('sorts phase column alphabetically by phase label', async () => {
    const user = userEvent.setup();
    const rows = [
      makePhaseSortRow(1, 'option.zeta', 'option.detailC'),
      makePhaseSortRow(2, 'option.beta', 'option.detailB'),
      makePhaseSortRow(3, 'option.alpha', 'option.detailA'),
    ];

    const { getByTestId, getAllByRole } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    await user.click(getByTestId('hds-table-sorting-header-phase'));

    const tableRows = getAllByRole('row');
    expect(within(tableRows[1]).getByText('Sort project 3')).toBeInTheDocument();
    expect(within(tableRows[2]).getByText('Sort project 2')).toBeInTheDocument();
    expect(within(tableRows[3]).getByText('Sort project 1')).toBeInTheDocument();
  });

  it('sorts phase detail column alphabetically by phase detail label', async () => {
    const user = userEvent.setup();
    const rows = [
      makePhaseSortRow(1, 'option.alpha', 'option.detailC'),
      makePhaseSortRow(2, 'option.alpha', 'option.detailB'),
      makePhaseSortRow(3, 'option.alpha', 'option.detailA'),
    ];

    const { getByTestId, getAllByRole } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    await user.click(getByTestId('hds-table-sorting-header-phaseDetail'));

    const tableRows = getAllByRole('row');
    expect(within(tableRows[1]).getByText('Sort project 3')).toBeInTheDocument();
    expect(within(tableRows[2]).getByText('Sort project 2')).toBeInTheDocument();
    expect(within(tableRows[3]).getByText('Sort project 1')).toBeInTheDocument();
  });

  it('keeps original row order when sorting a column with no values', async () => {
    const user = userEvent.setup();
    const rows = [
      makePhaseSortRow(1, 'option.alpha', ''),
      makePhaseSortRow(2, 'option.alpha', ''),
      makePhaseSortRow(3, 'option.alpha', ''),
    ];

    const { getByTestId, getAllByRole } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    const phaseDetailSortButton = getByTestId('hds-table-sorting-header-phaseDetail');
    await user.click(phaseDetailSortButton);
    await user.click(phaseDetailSortButton);

    const tableRows = getAllByRole('row');
    expect(within(tableRows[1]).getByText('Sort project 1')).toBeInTheDocument();
    expect(within(tableRows[2]).getByText('Sort project 2')).toBeInTheDocument();
    expect(within(tableRows[3]).getByText('Sort project 3')).toBeInTheDocument();
  });
});
