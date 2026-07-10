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
  projectCostForecast: '100',
  planningCostForecast: '100',
  planningPhaseId: 'planning-phase-id',
  planningWorkQuantity: '10',
  constructionCostForecast: '200',
  costForecast: '300',
  phase: 'option.design',
  phaseValue: 'design',
  phaseId: 'phase-id',
  functions: 'myWorkloadView.table.modifyInformation',
  budget: '',
  constructionProcurementMethod: undefined,
});

const makeDateSortRow = (index: number, planningStart: string): MyWorkloadTableRow => ({
  ...makeRow(index),
  planningStart,
  planningEnd: planningStart,
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

<<<<<<< HEAD:src/views/MyWorkloadView/MyWorkloadTable.test.tsx
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
=======
  it('opens edit dialog for selected row when modify button is clicked', async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByTestId } = render(
      <MyWorkloadTable listOfProjects={[makeRow(1), makeRow(2)]} viewType="design" />,
>>>>>>> 7804e8bc (feat(ui): added tasks-section to myworkload-view):src/components/MyWorkload/Table/MyWorkloadTable.test.tsx
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
<<<<<<< HEAD:src/views/MyWorkloadView/MyWorkloadTable.test.tsx
      <MyWorkloadTable
        listOfProjects={[makeRow(1)]}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
=======
      <MyWorkloadTable listOfProjects={[makeRow(1)]} viewType="design" />,
>>>>>>> 7804e8bc (feat(ui): added tasks-section to myworkload-view):src/components/MyWorkload/Table/MyWorkloadTable.test.tsx
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
<<<<<<< HEAD:src/views/MyWorkloadView/MyWorkloadTable.test.tsx
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
=======
      <MyWorkloadTable listOfProjects={rows} viewType="design" />,
>>>>>>> 7804e8bc (feat(ui): added tasks-section to myworkload-view):src/components/MyWorkload/Table/MyWorkloadTable.test.tsx
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
<<<<<<< HEAD:src/views/MyWorkloadView/MyWorkloadTable.test.tsx
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
=======
      <MyWorkloadTable listOfProjects={rows} viewType="design" />,
>>>>>>> 7804e8bc (feat(ui): added tasks-section to myworkload-view):src/components/MyWorkload/Table/MyWorkloadTable.test.tsx
    );

    const planningStartSortButton = getByTestId('hds-table-sorting-header-planningStart');
    await user.click(planningStartSortButton);
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
});
