import { fireEvent, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MyWorkloadEditDialogProps,
  MyWorkloadTableRow,
  MyWorkloadViewType,
} from '@/interfaces/myWorkloadInterfaces';
import * as myWorkloadUtils from '@/utils/myWorkloadUtils';
import MyWorkloadTable from './MyWorkloadTable';
import type { MockInstance } from 'vitest';

vi.mock('react-i18next', async () => (await import('@/mocks/mockI18next')).default());
vi.mock('@/hooks/common', () => ({
  useAppSelector: () => [
    { id: 'phase-id', value: 'design' },
    { id: 'phase-construction', value: 'construction' },
    { id: 'phase-completed', value: 'completed' },
  ],
}));
let consoleErrorSpy: MockInstance;

vi.mock('./MyWorkloadEditDialog', () => ({
  __esModule: true,
  default: ({ isOpen, project, groupName, onSave }: MyWorkloadEditDialogProps) => (
    <div data-testid="mock-edit-dialog">
      {isOpen ? `open:${project?.projectName}` : 'closed'}
      {isOpen && <span data-testid="mock-dialog-group">{groupName}</span>}
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
      <button
        type="button"
        onClick={() =>
          project &&
          onSave({
            ...project,
            phase: {
              id: 'phase-construction',
              value: 'construction',
              label: 'option.construction',
            },
          })
        }
      >
        trigger-phase-save
      </button>
    </div>
  ),
}));

const makeRow = (index: number): MyWorkloadTableRow => ({
  id: `project-${index}`,
  projectGroup: null,
  groupName: '',
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
  constructionStart: planningStart,
  constructionEnd: planningStart,
});

const dateSortCases: Array<{
  viewType: MyWorkloadViewType;
  colKey: keyof MyWorkloadTableRow;
}> = [
  { viewType: 'planning', colKey: 'planningStart' },
  { viewType: 'planning', colKey: 'planningEnd' },
  { viewType: 'planning', colKey: 'constructionStart' },
  { viewType: 'construction', colKey: 'planningEnd' },
  { viewType: 'construction', colKey: 'constructionStart' },
  { viewType: 'construction', colKey: 'constructionEnd' },
];

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
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => {
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

  it.each<MyWorkloadViewType>(['planning', 'construction'])(
    'shows and sorts group names in the first column in the %s view',
    async (viewType) => {
      const user = userEvent.setup();
      const rows = [
        { ...makeRow(1), projectGroup: 'group-z' },
        { ...makeRow(2), projectGroup: 'group-a' },
        makeRow(3),
      ];
      const { getAllByRole, getByTestId } = render(
        <MyWorkloadTable
          listOfProjects={rows}
          groupNames={
            new Map([
              ['group-z', 'Zeta'],
              ['group-a', 'Alpha'],
            ])
          }
          isLoading={false}
          hasError={false}
          viewType={viewType}
        />,
      );

      expect(getAllByRole('columnheader')[0]).toHaveTextContent('myWorkloadView.table.group');
      const values = () =>
        getAllByRole('row')
          .slice(1)
          .map((row) =>
            within(row)
              .getAllByRole('cell')
              .slice(0, 2)
              .map((cell) => cell.textContent),
          );
      expect(values()).toEqual([
        ['Zeta', 'Project 1'],
        ['Alpha', 'Project 2'],
        ['', 'Project 3'],
      ]);
      await user.click(getByTestId('hds-table-sorting-header-groupName'));
      expect(values()).toEqual([
        ['', 'Project 3'],
        ['Alpha', 'Project 2'],
        ['Zeta', 'Project 1'],
      ]);
      await user.click(getByTestId('hds-table-sorting-header-groupName'));
      expect(values()).toEqual([
        ['Zeta', 'Project 1'],
        ['Alpha', 'Project 2'],
        ['', 'Project 3'],
      ]);
    },
  );

  it('updates group names in the table and open dialog without losing saved changes', async () => {
    const user = userEvent.setup();
    const rows = [{ ...makeRow(1), projectGroup: 'group-1' }];
    const { getByRole, getByTestId, getByText, rerender } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    await user.click(getByRole('button', { name: /myWorkloadView.table.modifyInformation/i }));
    expect(getByTestId('mock-dialog-group')).toBeEmptyDOMElement();
    await user.click(getByRole('button', { name: 'trigger-save' }));
    rerender(
      <MyWorkloadTable
        listOfProjects={rows}
        groupNames={new Map([['group-1', 'Updated group']])}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    expect(getByText('Project 1 (saved)')).toBeInTheDocument();
    expect(getByTestId('mock-dialog-group')).toHaveTextContent('Updated group');
    expect(
      within(getByRole('row', { name: /Project 1 \(saved\)/ })).getAllByRole('cell')[0],
    ).toHaveTextContent('Updated group');
  });

  it('keeps long descriptions available and sorts by their full values', async () => {
    const user = userEvent.setup();
    const description = 'A very long description '.repeat(10).trim();
    const { getAllByRole, getByTestId, getByTitle } = render(
      <MyWorkloadTable
        listOfProjects={[
          { ...makeRow(1), description: `Z ${description}` },
          { ...makeRow(2), description },
        ]}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    expect(getByTitle(description)).toHaveTextContent(description);
    await user.click(getByTestId('hds-table-sorting-header-description'));
    expect(
      getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1].textContent),
    ).toEqual(['Project 2', 'Project 1']);
  });

  it.each<MyWorkloadViewType>(['planning', 'construction'])(
    'fits the %s table, responds to resizing, and restores normal size',
    async (viewType) => {
      const user = userEvent.setup();
      const { getByRole, getByTestId, getByText } = render(
        <MyWorkloadTable
          listOfProjects={Array.from({ length: 11 }, (_, index) => makeRow(index + 1))}
          isLoading={false}
          hasError={false}
          viewType={viewType}
        />,
      );
      const toggle = getByRole('checkbox', { name: 'myWorkloadView.table.fitToWidth' });
      const viewport = getByTestId('my-workload-table-viewport');
      const content = getByTestId('my-workload-table-content');
      const table = getByRole('table');
      let availableWidth = 600;
      Object.defineProperty(viewport, 'clientWidth', { get: () => availableWidth });
      Object.defineProperty(table, 'scrollWidth', { value: 1200 });
      Object.defineProperty(content, 'offsetHeight', {
        get: () => table.querySelectorAll('tbody tr').length * 40,
      });

      expect(toggle).not.toBeChecked();
      expect(content.style.transform).toBe('');
      await user.click(toggle);
      expect(toggle).toBeChecked();
      expect(content).toHaveStyle({ width: '1200px', transform: 'scale(0.5)' });
      expect(viewport).toHaveStyle({ height: '200px' });
      expect(getByText('myWorkloadView.myWorkload').closest('[data-testid]')).toBeNull();
      expect(toggle.closest('[data-testid]')).toBeNull();
      const pagination = getByTestId('my-workload-pagination-container');
      expect(content.contains(pagination)).toBe(false);
      await user.click(within(pagination).getByRole('link', { name: 'Sivu 2' }));
      expect(content).toHaveStyle({ transform: 'scale(0.5)' });
      expect(viewport).toHaveStyle({ height: '20px' });
      await user.click(within(pagination).getByRole('link', { name: 'Sivu 1' }));
      expect(viewport).toHaveStyle({ height: '200px' });

      availableWidth = 0;
      fireEvent(window, new Event('resize'));
      expect(content).toHaveStyle({ transform: 'scale(0.5)' });

      availableWidth = 900;
      fireEvent(window, new Event('resize'));
      expect(content).toHaveStyle({ transform: 'scale(0.75)' });
      expect(viewport).toHaveStyle({ height: '300px' });

      availableWidth = 1500;
      fireEvent(window, new Event('resize'));
      expect(content).toHaveStyle({ width: '1500px', transform: 'scale(1)' });
      expect(viewport).toHaveStyle({ height: '400px' });

      await user.click(toggle);
      expect(content.style.transform).toBe('');
      expect(content.style.width).toBe('');
      expect(viewport.style.height).toBe('');
    },
  );

  it('does not offer fitting when there is no table', () => {
    const { queryByRole } = render(
      <MyWorkloadTable
        listOfProjects={[]}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );
    expect(queryByRole('checkbox', { name: 'myWorkloadView.table.fitToWidth' })).toBeNull();
  });

  it('resets sorting and allows sorting again', async () => {
    const user = userEvent.setup();
    const { getByTestId, getAllByRole, getByText } = render(
      <MyWorkloadTable
        listOfProjects={[makeRow(3), makeRow(1), makeRow(2)]}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );
    const resetButton = getByText('myWorkloadView.table.resetSort');
    const projectOrder = () =>
      getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1].textContent);

    expect(resetButton).not.toBeVisible();
    await user.click(getByTestId('hds-table-sorting-header-projectName'));
    expect(resetButton).toBeVisible();
    expect(projectOrder()).toEqual(['Project 1', 'Project 2', 'Project 3']);

    await user.click(resetButton);
    expect(resetButton).not.toBeVisible();
    expect(projectOrder()).toEqual(['Project 3', 'Project 1', 'Project 2']);
    expect(getByText('myWorkloadView.myWorkload')).toHaveFocus();

    await user.click(getByTestId('hds-table-sorting-header-projectName'));
    expect(resetButton).toBeVisible();
    expect(projectOrder()).toEqual(['Project 1', 'Project 2', 'Project 3']);

    await user.click(resetButton);
    expect(resetButton).not.toBeVisible();
    expect(projectOrder()).toEqual(['Project 3', 'Project 1', 'Project 2']);
    await user.click(getByTestId('hds-table-sorting-header-projectName'));
    expect(projectOrder()).toEqual(['Project 1', 'Project 2', 'Project 3']);
  });

  it('resets to the first page without losing saved changes', async () => {
    const user = userEvent.setup();
    const rows = Array.from({ length: 11 }, (_, index) => makeRow(11 - index));
    const { getAllByRole, getByRole, getByTestId, getByText, queryByText } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    await user.click(
      getAllByRole('button', { name: /myWorkloadView.table.modifyInformation/i })[0],
    );
    await user.click(getByRole('button', { name: 'trigger-save' }));
    await user.click(getByTestId('hds-table-sorting-header-projectName'));
    await user.click(
      within(getByTestId('my-workload-pagination-container')).getByRole('link', { name: 'Sivu 2' }),
    );
    expect(getByText('Project 11 (saved)')).toBeInTheDocument();

    await user.click(getByText('myWorkloadView.table.resetSort'));
    const projectOrder = getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getAllByRole('cell')[1].textContent);
    expect(projectOrder).toEqual([
      'Project 11 (saved)',
      ...Array.from({ length: 9 }, (_, index) => `Project ${10 - index}`),
    ]);
    expect(queryByText('Project 1')).not.toBeInTheDocument();
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

  it.each<MyWorkloadViewType>(['planning', 'construction'])(
    'filters multiple phases immediately and clears the filter in the %s view',
    async (viewType) => {
      const user = userEvent.setup();
      const rows = [
        makeRow(1),
        {
          ...makeRow(2),
          phase: { id: 'phase-construction', value: 'construction', label: 'option.construction' },
        },
        { ...makeRow(3), phase: { id: '', value: '', label: '' } },
      ];
      const { getByRole, getByText, queryByText } = render(
        <MyWorkloadTable
          listOfProjects={rows}
          isLoading={false}
          hasError={false}
          viewType={viewType}
        />,
      );

      await user.click(getByRole('combobox', { name: /myWorkloadView.table.phaseFilter/ }));
      expect(getByText('option.completed')).toBeInTheDocument();
      await user.click(getByRole('option', { name: 'option.design' }));
      expect(getByText('Project 1')).toBeInTheDocument();
      expect(queryByText('Project 2')).not.toBeInTheDocument();
      expect(queryByText('Project 3')).not.toBeInTheDocument();
      await user.click(getByRole('option', { name: 'option.construction' }));
      expect(getByText('Project 2')).toBeInTheDocument();
      expect(queryByText('Project 3')).not.toBeInTheDocument();
      await user.click(getByRole('button', { name: 'myWorkloadView.table.clearPhaseFilter' }));
      expect(getByText('Project 1')).toBeInTheDocument();
      expect(getByText('Project 2')).toBeInTheDocument();
      expect(getByText('Project 3')).toBeInTheDocument();
      await user.click(getByRole('combobox', { name: /myWorkloadView.table.phaseFilter/ }));
      await user.click(getByRole('option', { name: 'option.completed' }));
      expect(getByText('myWorkloadView.table.noPhaseMatches')).toBeInTheDocument();
      expect(queryByText('myWorkloadView.table.emptyText')).not.toBeInTheDocument();
      await user.click(getByRole('button', { name: 'myWorkloadView.table.clearPhaseFilter' }));
      expect(getByText('Project 3')).toBeInTheDocument();
    },
  );

  it('resets pagination, keeps sorting and preserves the filter when changing views', async () => {
    const user = userEvent.setup();
    const rows = Array.from({ length: 11 }, (_, index) => makeRow(11 - index));
    rows[0] = {
      ...rows[0],
      phase: { id: 'phase-construction', value: 'construction', label: 'option.construction' },
    };
    const { getAllByRole, getByRole, getByTestId, getByText, queryByText, rerender } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );
    await user.click(getByTestId('hds-table-sorting-header-projectName'));
    await user.click(
      within(getByTestId('my-workload-pagination-container')).getByRole('link', { name: 'Sivu 2' }),
    );
    await user.click(getByRole('combobox', { name: /myWorkloadView.table.phaseFilter/ }));
    await user.click(getByRole('option', { name: 'option.design' }));
    expect(getByText('Project 1')).toBeInTheDocument();
    expect(queryByText('Project 11')).not.toBeInTheDocument();
    expect(
      getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1].textContent),
    ).toEqual([
      'Project 1',
      'Project 10',
      'Project 2',
      'Project 3',
      'Project 4',
      'Project 5',
      'Project 6',
      'Project 7',
      'Project 8',
      'Project 9',
    ]);
    rerender(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={true}
        hasError={false}
        viewType="construction"
      />,
    );
    rerender(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="construction"
      />,
    );
    expect(getByText('Project 1')).toBeInTheDocument();
    expect(queryByText('Project 11')).not.toBeInTheDocument();
  });

  it('shows a recoverable empty result after a saved phase changes', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText, queryByText } = render(
      <MyWorkloadTable
        listOfProjects={[makeRow(1)]}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );
    await user.click(getByRole('combobox', { name: /myWorkloadView.table.phaseFilter/ }));
    await user.click(getByRole('option', { name: 'option.design' }));
    await user.click(getByRole('button', { name: /myWorkloadView.table.modifyInformation/i }));
    await user.click(getByRole('button', { name: 'trigger-phase-save' }));
    expect(queryByText('Project 1')).not.toBeInTheDocument();
    expect(getByText('myWorkloadView.table.noPhaseMatches')).toBeInTheDocument();
    await user.click(getByRole('button', { name: 'myWorkloadView.table.clearPhaseFilter' }));
    expect(getByText('Project 1')).toBeInTheDocument();
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

  it.each(dateSortCases)(
    'sorts $colKey chronologically in both directions in the $viewType view',
    async ({ viewType, colKey }) => {
      const user = userEvent.setup();
      const rows = [
        makeDateSortRow(1, '31.12.2025'),
        makeDateSortRow(2, '01.02.2026'),
        makeDateSortRow(3, '15.01.2026'),
        makeDateSortRow(4, '02.01.2027'),
        makeDateSortRow(5, '29.02.2024'),
      ];
      const { getByTestId, getAllByRole } = render(
        <MyWorkloadTable
          listOfProjects={rows}
          isLoading={false}
          hasError={false}
          viewType={viewType}
        />,
      );
      const projectOrder = () =>
        getAllByRole('row')
          .slice(1)
          .map((row) => within(row).getAllByRole('cell')[1].textContent);
      const sortButton = getByTestId(`hds-table-sorting-header-${colKey}`);

      await user.click(sortButton);
      expect(projectOrder()).toEqual([
        'Project 5',
        'Project 1',
        'Project 3',
        'Project 2',
        'Project 4',
      ]);

      await user.click(sortButton);
      expect(projectOrder()).toEqual([
        'Project 4',
        'Project 2',
        'Project 3',
        'Project 1',
        'Project 5',
      ]);
    },
  );

  it('groups empty and invalid dates and compares equivalent supported date formats', async () => {
    const user = userEvent.setup();
    const rows = [
      makeDateSortRow(1, ''),
      makeDateSortRow(2, '2026-02-01'),
      makeDateSortRow(3, '31.02.2026'),
      makeDateSortRow(4, ' 1. 2.2026 '),
      makeDateSortRow(5, '31.01.2026'),
      makeDateSortRow(6, ''),
    ];
    const { getByTestId, getAllByRole } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );
    const displayedDates = () =>
      getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[3].textContent);
    const sortButton = getByTestId('hds-table-sorting-header-planningStart');

    await user.click(sortButton);
    expect(displayedDates()).toEqual(['', '', '', '31.1.2026', '1.2.2026', '1.2.2026']);

    await user.click(sortButton);
    expect(displayedDates()).toEqual(['1.2.2026', '1.2.2026', '31.1.2026', '', '', '']);
  });

  it('keeps row order when every date is empty or invalid', async () => {
    const user = userEvent.setup();
    const { getByTestId, getAllByRole } = render(
      <MyWorkloadTable
        listOfProjects={[
          makeDateSortRow(1, ''),
          makeDateSortRow(2, '31.02.2026'),
          makeDateSortRow(3, ''),
        ]}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );
    const sortButton = getByTestId('hds-table-sorting-header-planningStart');
    await user.click(sortButton);
    await user.click(sortButton);

    expect(
      getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1].textContent),
    ).toEqual(['Project 1', 'Project 2', 'Project 3']);
  });

  it('parses distinct dates only when row data changes, not when sorting or paging', async () => {
    const user = userEvent.setup();
    const parseDateSpy = vi.spyOn(myWorkloadUtils, 'getMyWorkloadDateTimeValue');
    try {
      const rows = Array.from({ length: 11 }, (_, index) =>
        makeDateSortRow(index + 1, `${index + 1}.1.2026`),
      );
      const { getByTestId, rerender } = render(
        <MyWorkloadTable
          listOfProjects={rows}
          isLoading={false}
          hasError={false}
          viewType="planning"
        />,
      );
      expect(parseDateSpy).toHaveBeenCalledTimes(11);

      const sortButton = getByTestId('hds-table-sorting-header-planningStart');
      await user.click(sortButton);
      await user.click(sortButton);
      await user.click(getByTestId('hds-table-sorting-header-planningEnd'));
      await user.click(
        within(getByTestId('my-workload-pagination-container')).getByRole('link', {
          name: 'Sivu 2',
        }),
      );
      expect(parseDateSpy).toHaveBeenCalledTimes(11);

      rerender(
        <MyWorkloadTable
          listOfProjects={[makeDateSortRow(1, '01.01.2025'), ...rows.slice(1)]}
          isLoading={false}
          hasError={false}
          viewType="planning"
        />,
      );
      expect(parseDateSpy).toHaveBeenCalledTimes(22);
      expect(parseDateSpy).toHaveBeenCalledWith('01.01.2025');
    } finally {
      parseDateSpy.mockRestore();
    }
  });

  it('sorts full dataset by date and keeps sorting when changing pages', async () => {
    const user = userEvent.setup();
    const rows = [
      makeDateSortRow(1, '31.12.2024'),
      makeDateSortRow(2, '15.01.2025'),
      makeDateSortRow(3, '01.02.2025'),
      makeDateSortRow(4, '31.12.2025'),
      makeDateSortRow(5, '02.01.2026'),
      makeDateSortRow(6, '15.01.2026'),
      makeDateSortRow(7, '01.02.2026'),
      makeDateSortRow(8, '15.03.2026'),
      makeDateSortRow(9, '01.04.2026'),
      makeDateSortRow(10, '31.12.2026'),
      makeDateSortRow(11, '01.01.2027'),
      makeDateSortRow(12, '15.02.2027'),
    ];

    const { getByTestId, queryByText, getAllByRole } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    const planningStartSortButton = getByTestId('hds-table-sorting-header-planningStart');
    const projectOrder = () =>
      getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1].textContent);
    await user.click(planningStartSortButton);
    expect(projectOrder()).toEqual(
      Array.from({ length: 10 }, (_, index) => `Project ${index + 1}`),
    );

    expect(queryByText('AÖ')).not.toBeInTheDocument();
    expect(queryByText('ÖA')).not.toBeInTheDocument();

    await user.click(planningStartSortButton);
    expect(projectOrder()).toEqual(
      Array.from({ length: 10 }, (_, index) => `Project ${12 - index}`),
    );

    await waitFor(() => {
      expect(queryByText('Project 12')).toBeInTheDocument();
      expect(queryByText('Project 2')).not.toBeInTheDocument();
    });

    const paginationContainer = getByTestId('my-workload-pagination-container');
    const pageTwoButton = within(paginationContainer).getByRole('link', { name: 'Sivu 2' });
    await user.click(pageTwoButton);
    expect(projectOrder()).toEqual(['Project 2', 'Project 1']);

    await waitFor(() => {
      expect(queryByText('Project 2')).toBeInTheDocument();
      expect(queryByText('Project 12')).not.toBeInTheDocument();
    });
  });

  it.each<MyWorkloadViewType>(['planning', 'construction'])(
    'sorts phases by lifecycle and construction start in both directions in the %s view',
    async (viewType) => {
      const user = userEvent.setup();
      const phaseValues = [
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
      const rows = phaseValues.map((value, index) => ({
        ...makeRow(index + 1),
        phase: { id: value, value, label: `Label ${9 - index}` },
      }));
      const planningPhase = rows[3].phase;
      rows.push({
        ...makeRow(10),
        constructionStart: '31.12.2026',
        planningStart: '01.01.2028',
        phase: planningPhase,
      });
      const { getByTestId, getAllByRole } = render(
        <MyWorkloadTable
          listOfProjects={rows.reverse()}
          isLoading={false}
          hasError={false}
          viewType={viewType}
        />,
      );
      const projectOrder = () =>
        getAllByRole('row')
          .slice(1)
          .map((row) => within(row).getAllByRole('cell')[1].textContent);
      const expectedOrder = [1, 2, 3, 10, 4, 5, 6, 7, 8, 9].map((index) => `Project ${index}`);
      const sortButton = getByTestId('hds-table-sorting-header-phase');

      await user.click(sortButton);
      expect(projectOrder()).toEqual(expectedOrder);

      await user.click(sortButton);
      expect(projectOrder()).toEqual([...expectedOrder].reverse());
    },
  );

  it('sorts unlisted phases as a fallback group and handles missing or invalid construction dates', async () => {
    const user = userEvent.setup();
    const rows = [
      { value: 'suspended', date: '01.01.2027' },
      { value: 'construction', date: '2026-02-01' },
      { value: 'construction', date: '' },
      { value: 'construction', date: '31.02.2026' },
      { value: 'construction', date: ' 1. 2.2026 ' },
      { value: 'construction', date: '31.01.2026' },
      { value: 'legacyPhase', date: '31.12.2026' },
      { value: '', date: '' },
      { value: 'completed', date: '01.01.2028' },
    ].map(({ value, date }, index) => ({
      ...makeRow(index + 1),
      phase: { id: value, value, label: value },
      constructionStart: date,
    }));

    const { getByTestId, getAllByRole } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );

    const projectOrder = () =>
      getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1].textContent);
    const sortButton = getByTestId('hds-table-sorting-header-phase');

    await user.click(sortButton);
    expect(projectOrder().slice(0, 2)).toEqual(expect.arrayContaining(['Project 3', 'Project 4']));
    expect(projectOrder().slice(2, 3)).toEqual(['Project 6']);
    expect(projectOrder().slice(3, 5)).toEqual(expect.arrayContaining(['Project 2', 'Project 5']));
    expect(projectOrder().slice(5)).toEqual(['Project 9', 'Project 8', 'Project 7', 'Project 1']);

    await user.click(sortButton);
    expect(projectOrder().slice(0, 4)).toEqual([
      'Project 1',
      'Project 7',
      'Project 8',
      'Project 9',
    ]);
    expect(projectOrder().slice(4, 6)).toEqual(expect.arrayContaining(['Project 2', 'Project 5']));
    expect(projectOrder().slice(6, 7)).toEqual(['Project 6']);
    expect(projectOrder().slice(7)).toEqual(expect.arrayContaining(['Project 3', 'Project 4']));
  });

  it('keeps phase and construction date sorting across pages and row updates', async () => {
    const user = userEvent.setup();
    const rows = Array.from({ length: 12 }, (_, index) => ({
      ...makeRow(index + 1),
      phase: { id: 'phase-id', value: 'designPlanning', label: 'option.designPlanning' },
      constructionStart: `${12 - index}.1.2026`,
    }));
    const { getByTestId, getAllByRole, rerender } = render(
      <MyWorkloadTable
        listOfProjects={rows}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );
    const projectOrder = () =>
      getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1].textContent);
    const sortButton = getByTestId('hds-table-sorting-header-phase');
    const pageLink = (pageNumber: number) =>
      within(getByTestId('my-workload-pagination-container')).getByRole('link', {
        name: `Sivu ${pageNumber}`,
      });

    await user.click(sortButton);
    expect(projectOrder()).toEqual(
      Array.from({ length: 10 }, (_, index) => `Project ${12 - index}`),
    );
    await user.click(pageLink(2));
    expect(projectOrder()).toEqual(['Project 2', 'Project 1']);

    await user.click(sortButton);
    expect(projectOrder()).toEqual(['Project 11', 'Project 12']);
    await user.click(pageLink(1));
    expect(projectOrder()).toEqual(
      Array.from({ length: 10 }, (_, index) => `Project ${index + 1}`),
    );

    rerender(
      <MyWorkloadTable
        listOfProjects={rows.map((row) =>
          row.id === 'project-12' ? { ...row, constructionStart: '01.01.2028' } : row,
        )}
        isLoading={false}
        hasError={false}
        viewType="planning"
      />,
    );
    expect(projectOrder()).toEqual([
      'Project 12',
      ...Array.from({ length: 9 }, (_, index) => `Project ${index + 1}`),
    ]);
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
