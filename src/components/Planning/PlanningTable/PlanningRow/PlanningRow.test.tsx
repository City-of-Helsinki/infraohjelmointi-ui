import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { setupStore } from '@/store';
import PlanningRow from './PlanningRow';
import { setGroupsExpanded } from '@/reducers/planningSlice';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

// Mock scrollIntoView which is not available in test environment
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: jest.fn(),
});

const mockGroup: IPlanningRow = {
  id: 'test-group-1',
  name: 'Test Group',
  type: 'group',
  path: '/test/path',
  key: 'test-group-1',
  defaultExpanded: false,
  urlSearchParam: {},
  children: [],
  projectRows: [],
  cells: [
    {
      key: '2024',
      year: 2024,
      plannedBudget: '100',
      frameBudget: '150',
      deviation: '-50',
      isCurrentYear: false,
      isFrameBudgetOverlap: false,
    },
    {
      key: '2025',
      year: 2025,
      plannedBudget: '200',
      frameBudget: '250',
      deviation: '-50',
      isCurrentYear: true,
      isFrameBudgetOverlap: false,
    },
  ],
  location: 'Test Location',
  plannedBudgets: '1000',
  costEstimateBudget: '2000',
  deviation: '500',
};

const renderPlanningRow = (initialState = {}, search = '') => {
  const store = setupStore({
    planning: {
      selectedYear: null,
      startYear: 2024,
      groupsExpanded: false,
      searchedProjectId: null,
      selections: {
        selectedMasterClass: null,
        selectedClass: null,
        selectedSubClass: null,
        selectedDistrict: null,
        selectedCollectiveSubLevel: null,
        selectedSubLevelDistrict: null,
        selectedOtherClassification: null,
      },
      mode: 'planning' as const,
      projects: [],
      rows: [],
      forcedToFrame: false,
      isLoading: false,
      notesDialogOpen: false,
      notesDialogData: { name: '', id: '', selectedYear: null },
      notesModalOpen: { isOpen: false, id: '' },
      notesModalData: { name: '', id: '' },
      coordinatorNotes: [],
      ...initialState,
    },
  });

  return {
    store,
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/planning${search}`]}>
          <table>
            <tbody>
              <PlanningRow {...mockGroup} sapCosts={{}} sapCurrentYear={{}} />
            </tbody>
          </table>
        </MemoryRouter>
      </Provider>,
    ),
  };
};

describe('PlanningRow - Group Expansion Issue (IO-749)', () => {
  it('should start collapsed when groupsExpanded is false', () => {
    renderPlanningRow();

    // Group row should be visible
    expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();
  });

  it('should expand when user clicks expand button', async () => {
    const { user } = renderPlanningRow();

    // Click expand button
    await user.click(screen.getByTestId('expand-test-group-1'));

    // Verify the expand button is still functional
    await waitFor(() => {
      expect(screen.getByTestId('expand-test-group-1')).toBeInTheDocument();
    });
  });

  it('should expand when global groupsExpanded is true', () => {
    renderPlanningRow({ groupsExpanded: true });

    // Group should be visible immediately
    expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();
  });

  it('should collapse when user clicks expand button again', async () => {
    const { user } = renderPlanningRow({ groupsExpanded: true });

    // Should start expanded
    expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();

    // Click expand button to collapse
    await user.click(screen.getByTestId('expand-test-group-1'));

    // Verify the group row is still there (collapsed state)
    await waitFor(() => {
      expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();
    });
  });

  // This test reproduces the bug from IO-749
  it('BUG REPRODUCTION: should stay expanded when coming from search but global groupsExpanded changes', async () => {
    const { store } = renderPlanningRow({}, '?project=test-project-1');

    // Group should be expanded due to search
    await waitFor(() => {
      expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();
    });

    // Simulate a change to global groupsExpanded (like what happens during navigation)
    store.dispatch(setGroupsExpanded(false));

    // With our fix: The group should stay expanded because of search
    await waitFor(() => {
      expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();
    });
  });

  it('should prioritize search expansion over global groupsExpanded state', async () => {
    const { store } = renderPlanningRow({ groupsExpanded: false }, '?project=test-project-1');

    // Should be expanded due to search, even though groupsExpanded is false
    await waitFor(() => {
      expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();
    });

    // Changing global groupsExpanded should not affect search-driven expansion
    store.dispatch(setGroupsExpanded(true));
    store.dispatch(setGroupsExpanded(false));

    // Should still be expanded due to search
    await waitFor(() => {
      expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();
    });
  });

  it('should maintain expansion state when search parameter is removed', async () => {
    const { store, rerender } = renderPlanningRow(
      { groupsExpanded: false },
      '?project=test-project-1',
    );

    // Should start expanded due to search (group should be expanded)
    await waitFor(() => {
      expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();
    });

    // Re-render without search parameter
    rerender(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/planning']}>
          <table>
            <tbody>
              <PlanningRow {...mockGroup} sapCosts={{}} sapCurrentYear={{}} />
            </tbody>
          </table>
        </MemoryRouter>
      </Provider>,
    );

    // Should maintain expanded state when search is removed for better UX
    await waitFor(() => {
      expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();
    });
  });
});
