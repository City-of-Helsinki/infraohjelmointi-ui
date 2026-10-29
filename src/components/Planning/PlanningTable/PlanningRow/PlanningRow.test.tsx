import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { setupStore } from '@/store';
import PlanningRow from './PlanningRow';
import { setGroupsExpanded } from '@/reducers/planningSlice';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import mockProject from '@/mocks/mockProject';
import { createMockUserWithAdGroups } from '@/mocks/mockUsers';
import { IUser, UserRole } from '@/interfaces/userInterfaces';
import * as events from '@/utils/events';
import ProjectPhaseMenu from '@/components/CustomContextMenu/ContextMenus/ProjectPhaseContextMenu/ProjectPhaseMenu';
import ProjectRow from './ProjectRow/ProjectRow';

const mockPatchProject = jest.fn(() => ({ unwrap: () => Promise.resolve() }));

jest.mock('@/api/projectApi', () => ({
  ...jest.requireActual('@/api/projectApi'),
  usePatchProjectMutation: () => [mockPatchProject],
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
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
      isCurrentOrPastYear: false,
      isFrameBudgetOverlap: false,
    },
    {
      key: '2025',
      year: 2025,
      plannedBudget: '200',
      frameBudget: '250',
      deviation: '-50',
      isCurrentOrPastYear: true,
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
      selectedYears: [],
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
      projectsRequestId: { planning: null, coordination: null },
      rows: [],
      forcedToFrame: false,
      isLoading: false,
      notesDialogOpen: false,
      notesDialogData: { name: '', id: '', selectedYear: null },
      notesModalOpen: { isOpen: false, id: '', selectedYear: null },
      notesModalData: { name: '', id: '' },
      coordinatorNotes: [],
      hoverTooltipsEnabled: true,
      changeHistoryEnabled: false,
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
              <PlanningRow {...mockGroup} sapCosts={{}} />
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
    await act(async () => {
      store.dispatch(setGroupsExpanded(false));
    });

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
    await act(async () => {
      store.dispatch(setGroupsExpanded(true));
      store.dispatch(setGroupsExpanded(false));
    });

    // Should still be expanded due to search
    await waitFor(() => {
      expect(screen.getByTestId('row-test-group-1')).toBeInTheDocument();
    });
  });

  it('should expand the matching group from a group search parameter', async () => {
    const groupWithProject = {
      ...mockGroup,
      projectRows: [
        {
          ...mockProject.data,
          id: 'test-project-1',
          projectGroup: 'test-group-1',
        },
      ],
    };

    const store = setupStore({
      planning: {
        selectedYears: [],
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
        projectsRequestId: { planning: null, coordination: null },
        rows: [],
        forcedToFrame: false,
        isLoading: false,
        notesDialogOpen: false,
        notesDialogData: { name: '', id: '', selectedYear: null },
        notesModalOpen: { isOpen: false, id: '', selectedYear: null },
        notesModalData: { name: '', id: '' },
        coordinatorNotes: [],
        hoverTooltipsEnabled: true,
        changeHistoryEnabled: false,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/planning?group=test-group-1']}>
          <table>
            <tbody>
              <PlanningRow {...groupWithProject} sapCosts={{}} />
            </tbody>
          </table>
        </MemoryRouter>
      </Provider>,
    );

    expect(await screen.findByTestId('row-test-project-1-parent-test-group-1')).toBeInTheDocument();
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
              <PlanningRow {...mockGroup} sapCosts={{}} />
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

  it('should collapse and expand again when global groupsExpanded is toggled', async () => {
    const groupWithProject = {
      ...mockGroup,
      projectRows: [{ ...mockProject.data, id: 'test-project-1', projectGroup: 'test-group-1' }],
    };
    const store = setupStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/planning?class=test-class']}>
          <table>
            <tbody>
              <PlanningRow {...groupWithProject} sapCosts={{}} />
            </tbody>
          </table>
        </MemoryRouter>
      </Provider>,
    );
    const projectRow = () => screen.queryByTestId('row-test-project-1-parent-test-group-1');

    expect(projectRow()).not.toBeInTheDocument();

    await act(async () => {
      store.dispatch(setGroupsExpanded(true));
    });
    expect(projectRow()).toBeInTheDocument();

    await act(async () => {
      store.dispatch(setGroupsExpanded(false));
    });
    expect(projectRow()).not.toBeInTheDocument();

    await act(async () => {
      store.dispatch(setGroupsExpanded(true));
    });
    expect(projectRow()).toBeInTheDocument();
  });
});

describe('Planning project phase permissions', () => {
  const permissionCases: {
    name: string;
    roles: UserRole[];
    userOverrides: Partial<IUser>;
    isReadOnly: boolean;
  }[] = [
    { name: 'viewer-only user', roles: [UserRole.VIEWER], userOverrides: {}, isReadOnly: true },
    { name: 'planner', roles: [UserRole.PLANNER], userOverrides: {}, isReadOnly: false },
    {
      name: 'planner with a viewer role',
      roles: [UserRole.PLANNER, UserRole.VIEWER],
      userOverrides: {},
      isReadOnly: false,
    },
    {
      name: 'restricted programmer inside an assigned class',
      roles: [UserRole.VIEWER],
      userOverrides: { is_restricted_programmer: true, restricted_class_ids: ['allowed-class'] },
      isReadOnly: false,
    },
    {
      name: 'restricted programmer outside an assigned class',
      roles: [UserRole.VIEWER],
      userOverrides: { is_restricted_programmer: true, restricted_class_ids: ['other-class'] },
      isReadOnly: true,
    },
    {
      name: 'restricted programmer without assigned classes',
      roles: [UserRole.VIEWER],
      userOverrides: { is_restricted_programmer: true, restricted_class_ids: [] },
      isReadOnly: true,
    },
  ];

  beforeEach(() => {
    mockPatchProject.mockImplementation(() => ({ unwrap: () => Promise.resolve() }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(permissionCases)(
    'preserves phase permissions for $name',
    async ({ roles, userOverrides, isReadOnly }) => {
      const initialState = setupStore().getState();
      const store = setupStore({
        auth: { user: createMockUserWithAdGroups(roles, userOverrides), error: null },
        lists: {
          ...initialState.lists,
          phases: [
            { id: 'proposal', value: 'proposal' },
            { id: 'design', value: 'design' },
          ],
        },
      });
      const project = {
        ...mockProject.data,
        projectClass: 'allowed-class',
        phase: { id: 'proposal', value: 'proposal' },
        programmed: false,
      };
      const dispatchMenu = jest
        .spyOn(events, 'dispatchContextMenuEvent')
        .mockImplementation(() => undefined);
      const user = userEvent.setup();

      render(
        <Provider store={store}>
          <MemoryRouter>
            <table>
              <tbody>
                <ProjectRow project={project} parentId="test-group" sapCosts={{}} />
              </tbody>
            </table>
          </MemoryRouter>
        </Provider>,
      );

      await user.click(screen.getByTestId(`edit-phase-${project.id}`));

      expect(dispatchMenu).toHaveBeenCalledTimes(1);
      const menuProps = dispatchMenu.mock.calls[0][1].phaseMenuProps;
      expect(menuProps?.isReadOnly).toBe(isReadOnly);
      if (!menuProps) {
        throw new Error('Expected the project phase menu to open');
      }

      const onCloseMenu = jest.fn();
      render(
        <Provider store={store}>
          <ProjectPhaseMenu {...menuProps} onCloseMenu={onCloseMenu} />
        </Provider>,
      );

      if (isReadOnly) {
        expect(screen.getByTestId('select-design')).toBeDisabled();
        expect(screen.queryByTestId('patch-project-phase')).not.toBeInTheDocument();
        await user.click(screen.getByTestId('select-design'));
        menuProps.onSubmitPhase({ phase: 'design' });
        expect(mockPatchProject).not.toHaveBeenCalled();
      } else {
        await user.click(screen.getByTestId('select-design'));
        await user.click(screen.getByTestId('patch-project-phase'));
        expect(mockPatchProject).toHaveBeenCalledTimes(1);
        expect(mockPatchProject).toHaveBeenCalledWith({
          id: project.id,
          data: { phase: 'design' },
        });
        expect(onCloseMenu).toHaveBeenCalledTimes(1);
      }
    },
  );
});
