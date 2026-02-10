import axios from 'axios';
import {
  mockClasses,
  mockMasterClasses,
  mockProjectClasses,
  mockSubClasses,
} from '@/mocks/mockClasses';
import mockI18next from '@/mocks/mockI18next';
import { setupStore } from '@/store';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import PlanningView from './PlanningView';
import useUpdateEvents from '@/hooks/useUpdateEvents';
import { mockDistricts, mockDivisions, mockLocations } from '@/mocks/mockLocations';
import { mockProjectPhases } from '@/mocks/mockLists';
import { mockGroups } from '@/mocks/mockGroups';
import { Route } from 'react-router';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { act, fireEvent, waitFor, within } from '@testing-library/react';
import mockPlanningViewProjects from '@/mocks/mockPlanningViewProjects';
import mockProject from '@/mocks/mockProject';
import { IListItem } from '@/interfaces/common';
import { CustomContextMenu } from '@/components/CustomContextMenu';
import { listItemToOption } from '@/utils/common';
import { mockError } from '@/mocks/mockError';
import { getProjectsWithParams } from '@/services/projectServices';
import { IClassFinances } from '@/interfaces/classInterfaces';
import { mockClassFinances } from '@/mocks/mockClassFinances';
import { getPlanningRowTitle } from '@/hooks/useSummaryRows';
import {
  calculatePlanningCells,
  calculatePlanningRowSums,
  calculatePlanningSummaryCells,
  calculateProjectRowSums,
  formatNumber,
} from '@/utils/calculations';
import { sendProjectUpdateEvent, sendFinanceUpdateEvent } from '@/utils/testUtils';
import {
  addFinanceUpdateEventListener,
  removeFinanceUpdateEventListener,
  addProjectUpdateEventListener,
  removeProjectUpdateEventListener,
} from '@/utils/events';
import { getToday, updateYear } from '@/utils/dates';
import moment from 'moment';
import { updateClass, updateMasterClass } from '@/reducers/classSlice';
import { IGroup } from '@/interfaces/groupInterfaces';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());
jest.mock('@/components/shared', () => {
  const actualModule = jest.requireActual('@/components/shared');
  return {
    ...actualModule,
    Icon: ({ text }: { text?: string }) => (text ? <span>{text}</span> : null),
  };
});
jest.setTimeout(7000);

const mockedAxios = axios as jest.Mocked<typeof axios>;
const store = setupStore();

const PlanningViewTestApp = () => {
  useUpdateEvents();
  return (
    <>
      <PlanningView />
      <CustomContextMenu />
    </>
  );
};

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <>
        {/* Could there be a nicer way to render these instead of rendering the <PlanningView/> under two routes? */}
        <Route
          path="/"
          element={
            <>
              <PlanningViewTestApp />
            </>
          }
        >
          <Route path="/planning" element={<PlanningViewTestApp />} />
        </Route>
      </>,
      {
        preloadedState: {
          class: {
            ...store.getState().class,
            planning: {
              ...store.getState().class.planning,
              allClasses: mockProjectClasses.data,
              masterClasses: mockMasterClasses.data,
              classes: mockClasses.data,
              subClasses: mockSubClasses.data,
            },
          },
          location: {
            ...store.getState().location,
            planning: {
              ...store.getState().location.planning,
              allLocations: mockLocations.data,
              districts: mockDistricts.data,
              divisions: mockDivisions.data,
            },
          },
          group: {
            ...store.getState().group,
            planning: { ...store.getState().group.planning, groups: mockGroups.data },
          },
          lists: {
            ...store.getState().lists,
            phases: mockProjectPhases.data,
          },
        },
      },
    ),
  );

describe('PlanningView', () => {
  const asNumber = (value: string | null) => parseInt(value || '');
  const navigateToProjectRows = async (renderResult: CustomRenderResult) => {
    const { user, store, findByTestId } = renderResult;
    const { masterClasses, classes } = store.getState().class.planning;
    await user.click(await findByTestId(`expand-${masterClasses[0].id}`));
    await user.click(await findByTestId(`expand-${classes[0].id}`));
  };

  const openContextMenuForCell = async (
    year: number,
    id: string,
    renderResult: CustomRenderResult,
  ) => {
    const { findByTestId } = renderResult;
    fireEvent.contextMenu(await findByTestId(`project-cell-${year}-${id}`));
  };

  const monthLabelTestId = (targetYear: number, month: string) =>
    `month-label-${targetYear}-${month}`;
  const graphCellTestId = (targetYear: number, month: string) =>
    `graph-cell-${targetYear}-${month}`;
  const hoverClassName = (targetYear: number, month: string) => `hoverable-${targetYear}-${month}`;

  beforeEach(() => {
    mockGetResponseProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the container', async () => {
    const { container } = await render();

    expect(container.getElementsByClassName('planning-view-container')[0]).toBeInTheDocument();
  });

  it('catches a failed getProjectsWithParams request', async () => {
    mockedAxios.get.mockRejectedValueOnce(mockError);

    const year = new Date().getFullYear();

    await render();

    await waitFor(() =>
      getProjectsWithParams({ params: 'test=123', direct: false, forcedToFrame: false, year }),
    );

    const getMock = mockedAxios.get.mock.lastCall;

    expect(getMock[0]).toBe(
      `localhost:4000/projects/?test=123&year=${year}&forcedToFrame=false&direct=false`,
    );
  });

  it('updates table sums if the finance-update event triggers', async () => {
    const renderResult = await render();
    const { store, findByTestId } = renderResult;

    addFinanceUpdateEventListener(store.dispatch);

    const { id: masterClassId } = store.getState().class.planning.masterClasses[0];
    const year = new Date().getFullYear();

    const updatedFinances = {
      ...mockClassFinances,
      year0: {
        plannedBudget: 80000,
        frameBudget: 2000,
        isFrameBudgetOverlap: false,
      },
    };

    const financeUpdateData = {
      planning: {
        masterClass: {
          ...mockMasterClasses.data[0],
          finances: {
            ...updatedFinances,
          },
        },
        class: {
          ...mockClasses.data[0],
          finances: {
            ...updatedFinances,
          },
        },
      },
    };

    await navigateToProjectRows(renderResult);

    // Simulate what App.tsx does when receiving a finance-update event
    await waitFor(async () => {
      try {
        await sendFinanceUpdateEvent(financeUpdateData);
        store.dispatch(
          updateMasterClass({
            data: financeUpdateData.planning.masterClass,
            type: 'planning',
          }),
        );
        store.dispatch(updateClass({ data: financeUpdateData.planning.class, type: 'planning' }));
      } catch (e) {
        console.log('Error sending finance update event: ', e);
      }
    });

    expect(store.getState().events.financeUpdate).toStrictEqual(financeUpdateData);

    const { plannedBudget, frameBudget } = updatedFinances.year0;

    expect((await findByTestId(`planned-budget-${masterClassId}-${year}`)).textContent).toBe(
      formatNumber(plannedBudget),
    );
    expect((await findByTestId(`frame-budget-${masterClassId}-${year}`)).textContent).toBe(
      formatNumber(frameBudget),
    );
    expect((await findByTestId(`deviation-${masterClassId}-${year}`)).textContent).toBe(
      formatNumber(frameBudget - plannedBudget),
    );

    removeFinanceUpdateEventListener(store.dispatch);
  });

  describe('PlanningBreadCrumbs', () => {
    it('renders only first breadcrumb if no table row is expanded', async () => {
      const { findByTestId, queryByTestId, container } = await render();

      expect(container.getElementsByClassName('breadcrumbs-list')[0]).toBeInTheDocument();
      expect(await findByTestId('planning-breadcrumb')).toBeInTheDocument();
      expect(queryByTestId('masterClass-breadcrumb')).toBeNull();
      expect(queryByTestId('class-breadcrumb')).toBeNull();
      expect(queryByTestId('subClass-breadcrumb')).toBeNull();
      expect(queryByTestId('district-breadcrumb')).toBeNull();
    });

    it('renders breadcrumbs when table rows are expanded all the way to the selected district and navigates to planning frontpage from first breadcrumb', async () => {
      const { findByTestId, user, store, findAllByTestId, queryByTestId } = await render();

      const { masterClasses, classes, subClasses } = store.getState().class.planning;
      const { districts } = store.getState().location.planning;

      const { id: masterClassId } = masterClasses[0];
      const { id: classId } = classes[0];
      const { id: subClassId } = subClasses[0];
      const { id: districtId } = districts[0];

      await user.click(await findByTestId(`expand-${masterClassId}`));
      expect(await findByTestId('masterClass-breadcrumb')).toHaveAttribute(
        'href',
        `/planning?masterClass=${masterClassId}`,
      );

      await user.click(await findByTestId(`expand-${classId}`));
      expect(await findByTestId('class-breadcrumb')).toHaveAttribute(
        'href',
        `/planning?masterClass=${masterClassId}&class=${classId}`,
      );

      await user.click(await findByTestId(`expand-${subClassId}`));
      expect(await findByTestId('subClass-breadcrumb')).toHaveAttribute(
        'href',
        `/planning?masterClass=${masterClassId}&class=${classId}&subClass=${subClassId}`,
      );

      await user.click(await findByTestId(`expand-${districtId}`));
      expect(await findByTestId('district-breadcrumb')).toHaveAttribute(
        'href',
        `/planning?masterClass=${masterClassId}&class=${classId}&subClass=${subClassId}&district=${districtId}`,
      );

      expect((await findAllByTestId('breadcrumb-arrow')).length).toBe(4);

      await user.click(await findByTestId('planning-breadcrumb'));

      expect(queryByTestId('masterClass-breadcrumb')).toBeNull();
      expect(queryByTestId('class-breadcrumb')).toBeNull();
      expect(queryByTestId('subClass-breadcrumb')).toBeNull();
      expect(queryByTestId('district-breadcrumb')).toBeNull();
    });

    it('navigates to the clicked class', async () => {
      const { findByTestId, store, user, queryByTestId } = await render();

      const { masterClasses, classes, subClasses } = store.getState().class.planning;

      await user.click(await findByTestId(`expand-${masterClasses[0].id}`));
      await user.click(await findByTestId(`expand-${classes[0].id}`));
      await user.click(await findByTestId(`expand-${subClasses[0].id}`));

      expect(await findByTestId('class-breadcrumb')).toBeInTheDocument();
      expect(await findByTestId('subClass-breadcrumb')).toBeInTheDocument();

      await user.click(await findByTestId('masterClass-breadcrumb'));

      expect(queryByTestId('class-breadcrumb')).toBeNull();
      expect(queryByTestId('subClass-breadcrumb')).toBeNull();
    });
  });

  describe('PlanningToolbar', () => {
    it('doesnt render anything yet', async () => {
      const { findByTestId } = await render();

      expect(await findByTestId('toolbar')).toBeInTheDocument();
      expect(await findByTestId('toolbar-left')).toBeInTheDocument();
      expect(await findByTestId('toolbar-right')).toBeInTheDocument();
    });
  });

  describe('PlanningInfoPanel', () => {
    it('shows the view as planning and doesnt render selectedMasterClass name or previous button if no masterClass is expanded', async () => {
      const { getByTestId, queryByTestId, container, findByTestId } = await render();

      // Main container
      expect(container.getElementsByClassName('planning-info-panel')[0]).toBeInTheDocument();
      // Grid containers
      expect(await findByTestId('mode-indicator-container')).toHaveTextContent('planning');
      expect(getByTestId('selected-class-container')).toBeInTheDocument();
      expect(getByTestId('previous-button-container')).toBeInTheDocument();
      // Selected masterClass text
      expect(queryByTestId('selected-class')).toBeNull();
      expect(queryByTestId('currency-indicator')).toBeNull();
      // Previous button
      expect(queryByTestId('previous-button')).toBeNull();
    });

    it('shows the selectedMasterClass name and the previos-button if a masterClass is expanded', async () => {
      const { getByTestId, user, store, container } = await render();
      const planningClasses = store.getState().class.planning;
      const { id: masterClassId } = planningClasses.masterClasses[0];
      expect(container.getElementsByClassName('planning-summary-table')[0]).toBeInTheDocument();
      expect(getByTestId('planning-summary-head')).toBeInTheDocument();
      expect(getByTestId('planning-summary-head-row')).toBeInTheDocument();
      await user.click(getByTestId(`expand-${masterClassId}`));

      expect(getByTestId('selected-class')).toBeInTheDocument();
      expect(getByTestId('currency-indicator')).toBeInTheDocument();
      expect(getByTestId('previous-button')).toBeInTheDocument();
    });

    it('previous-button navigates back in history when clicked', async () => {
      const { getByTestId, user, store } = await render();
      const planningClasses = store.getState().class.planning;
      const { id: masterClassId } = planningClasses.masterClasses[0];
      const { id: classId } = planningClasses.classes[0];

      await user.click(getByTestId(`expand-${masterClassId}`));
      await user.click(getByTestId(`expand-${classId}`));

      expect(getByTestId('masterClass-breadcrumb')).toBeInTheDocument();
      expect(getByTestId('class-breadcrumb')).toBeInTheDocument();

      await user.click(getByTestId('previous-button'));

      //FIXME: navigate(-1) doesnt seem to work...
      // expect(queryByTestId('class-breadcrumb')).toBeNull();

      // await user.click(getByTestId('previous-button'));

      // expect(queryByTestId('masterClass-breadcrumb')).toBeNull();
    });
  });

  describe('PlanningSummaryTable', () => {
    it('renders all budgets of all masterClasses if a masterClass isnt selected', async () => {
      const { getByTestId, container, store } = await render();
      const { year } = mockClassFinances;
      const { masterClasses } = store.getState().class.planning;

      expect(container.getElementsByClassName('planning-summary-table')[0]).toBeInTheDocument();
      expect(getByTestId('planning-summary-head')).toBeInTheDocument();
      expect(getByTestId('planning-summary-head-row')).toBeInTheDocument();

      for (let i = 0; i < 11; i++) {
        const title = getPlanningRowTitle(year + i);
        const headCell = getByTestId(`head-${year + i}`);
        expect(headCell).toHaveTextContent((year + i).toString());
        expect(headCell).toHaveTextContent(title);
      }

      expect(getByTestId('planning-summary-body')).toBeInTheDocument();
      expect(getByTestId('planning-summary-planned-budget-row')).toBeInTheDocument();
      expect(getByTestId('planning-summary-realized-budget-row')).toBeInTheDocument();

      const cells = calculatePlanningSummaryCells(masterClasses, 'masterClass');
      cells.forEach(({ year, plannedBudget, frameBudget, deviation }) => {
        expect(getByTestId(`summary-budget-${year}`).textContent).toBe(plannedBudget);
        expect(getByTestId(`summary-frame-${year}`).textContent).toBe(frameBudget);
        expect(getByTestId(`summary-deviation-${year}`).textContent).toBe(deviation);
      });
    });

    it('renders the selectedMasterClasses financial data if a masterClass is expanded', async () => {
      const { getByTestId, user } = await render();

      const finances = mockClassFinances;
      const { id: masterClassId } = mockMasterClasses.data[0];

      await user.click(getByTestId(`expand-${masterClassId}`));

      const cells = calculatePlanningCells(finances, 'class');

      await waitFor(() => {
        cells.forEach(({ year, plannedBudget, frameBudget, deviation }) => {
          expect(getByTestId(`summary-budget-${year}`).textContent).toBe(plannedBudget);
          expect(getByTestId(`summary-frame-${year}`).textContent).toBe(frameBudget);
          expect(getByTestId(`summary-deviation-${year}`).textContent).toBe(deviation);
        });
      });
    });

    it('expands the monthly view and shows detailed info when clicking the current year and can be closed by clicking it again and another year can be expanded at the same time', async () => {
      const { user, getByTestId, queryByTestId } = await render();
      const year = new Date().getFullYear();
      const months = moment.months();

      await user.click(getByTestId(`expand-monthly-view-button-${year}`));

      expect(queryByTestId('date-indicator')).toBeVisible();

      months.forEach((m) => {
        expect(getByTestId(monthLabelTestId(year, m))).toHaveTextContent(m.substring(0, 3));
        expect(getByTestId(graphCellTestId(year, m))).toBeInTheDocument();
      });

      expect(getByTestId('date-today-label')).toHaveTextContent(getToday());
      expect(getByTestId('date-indicator')).toBeInTheDocument();
      expect(getByTestId('year-summary')).toBeInTheDocument();

      await user.click(getByTestId(`expand-monthly-view-button-${year + 1}`));

      expect(getByTestId('date-today-label')).toBeVisible();

      months.forEach((m) => {
        expect(getByTestId(monthLabelTestId(year, m))).toHaveTextContent(m.substring(0, 3));
        expect(getByTestId(monthLabelTestId(year + 1, m))).toHaveTextContent(m.substring(0, 3));
      });

      await user.click(getByTestId(`expand-monthly-view-button-${year + 1}`));

      months.forEach((m) => {
        expect(getByTestId(monthLabelTestId(year, m))).toBeInTheDocument();
        expect(queryByTestId(monthLabelTestId(year + 1, m))).toBeNull();
      });

      await user.click(getByTestId(`expand-monthly-view-button-${year}`));

      months.forEach((m) => {
        expect(queryByTestId(monthLabelTestId(year, m))).toBeNull();
      });
    });

    it('expands only the monthly view calendar when clicking the other years', async () => {
      const { user, getByTestId, queryByTestId } = await render();
      const year = new Date().getFullYear();
      const months = moment.months();

      await user.click(getByTestId(`expand-monthly-view-button-${year + 1}`));

      months.forEach((m) => {
        expect(getByTestId(monthLabelTestId(year + 1, m))).toHaveTextContent(m.substring(0, 3));
        expect(getByTestId(graphCellTestId(year + 1, m))).toBeInTheDocument();
      });

      expect(queryByTestId('date-today-label')).toBeNull();
      expect(queryByTestId('date-indicator')).not.toBeVisible();
      expect(queryByTestId('year-summary')).toBeNull();
    });

    it('adds the hovered class when a month is hovered', async () => {
      const { user, findByTestId, container } = await render();
      const year = new Date().getFullYear();
      const months = moment.months();

      await user.click(await findByTestId(`expand-monthly-view-button-${year + 1}`));

      // Test hovering for all levels and different months
      const april = hoverClassName(year + 1, months[3]);
      const aprilElements = container.getElementsByClassName(april);
      Array.from(aprilElements).forEach((c) => {
        expect(c.classList.contains('hovered')).toBeFalsy();
      });
      // Row 1 (planning summary head)
      await user.hover(aprilElements[0]);
      Array.from(aprilElements).forEach((c) => {
        expect(c.classList.contains('hovered')).toBeTruthy();
      });

      const may = hoverClassName(year + 1, months[4]);
      const mayElements = container.getElementsByClassName(may);

      // Row 2 (planning summary budget)
      await user.hover(mayElements[1]);
      // Hovering disappears from previous when hover changes
      Array.from(aprilElements).forEach((c) => {
        expect(c.classList.contains('hovered')).toBeFalsy();
      });
      Array.from(mayElements).forEach((c) => {
        expect(c.classList.contains('hovered')).toBeTruthy();
      });
      const june = hoverClassName(year + 1, months[5]);

      const juneElements = container.getElementsByClassName(june);
      // Row 3 (planning summary realized budget)
      await user.hover(juneElements[2]);
      Array.from(juneElements).forEach((c) => {
        expect(c.classList.contains('hovered')).toBeTruthy();
      });

      const july = hoverClassName(year + 1, months[6]);
      const julyElements = container.getElementsByClassName(july);

      // Row 4 (master class)
      await user.hover(julyElements[3]);
      Array.from(julyElements).forEach((c) => {
        expect(c.classList.contains('hovered')).toBeTruthy();
      });
    });
  });

  describe('PlanningTable', () => {
    it('renders the table', async () => {
      const { container } = await render();

      expect(container.getElementsByClassName('planning-table')[0]).toBeInTheDocument();
    });

    it('renders only masterClass rows, heads and cells if no masterClass is expanded', async () => {
      const { store, getByTestId, queryByTestId } = await render();

      const { masterClasses, classes, subClasses } = store.getState().class.planning;
      const { districts, divisions } = store.getState().location.planning;
      const { groups } = store.getState().group.planning;

      classes.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      subClasses.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      districts.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      divisions.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      groups.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      // Every masterClass has a row
      masterClasses.forEach(({ id }) => expect(getByTestId(`row-${id}`)).toBeInTheDocument());
    });

    it('renders all children rows and budgets for all but divisions and only one parent when parent is expanded', async () => {
      const { store, getByTestId, queryByTestId, user } = await render();

      const { masterClasses, classes, subClasses } = store.getState().class.planning;
      const { districts, divisions } = store.getState().location.planning;
      const { groups } = store.getState().group.planning;

      const projects = mockPlanningViewProjects.data.results;

      const expectRowProperties = async (
        finances: IClassFinances,
        id: string,
        isGroup?: boolean,
      ) => {
        const { plannedBudgets, costEstimateBudget, deviation } = calculatePlanningRowSums(
          finances,
          isGroup ? 'group' : 'class',
        );

        expect(getByTestId(`row-${id}`)).toBeInTheDocument();
        expect(getByTestId(`planned-budgets-${id}`).textContent).toBe(plannedBudgets);
        expect(getByTestId(`cost-estimate-budget-${id}`).textContent).toBe(costEstimateBudget);
        if (!isGroup) {
          expect(getByTestId(`deviation-${id}`).textContent).toBe(deviation);
        }
      };

      // Check that all masterClass-rows is visible
      masterClasses.forEach(({ id }) => expect(getByTestId(`row-${id}`)).toBeInTheDocument());

      // Click the first masterclass row
      const { id: masterClassId } = masterClasses[0];
      await user.click(getByTestId(`expand-${masterClassId}`));

      // Check that only first masterClass-row are visible
      await waitFor(() => {
        masterClasses.forEach(({ id, finances }, i) => {
          if (i === 0) {
            expectRowProperties(finances, id);
            expect(getByTestId(`row-${id}`).classList.contains('masterClass')).toBeTruthy();
          }
          if (i !== 0) {
            expect(queryByTestId(`row-${id}`)).toBeNull();
          }
        });
      });

      const classesForMasterClass = classes.filter((c) => c.parent === masterClassId);

      // Check that all class-rows are visible
      classesForMasterClass.forEach(({ id }) =>
        expect(getByTestId(`row-${id}`)).toBeInTheDocument(),
      );

      // Click the first class row
      const { id: classId } = classesForMasterClass[0];
      await user.click(getByTestId(`expand-${classId}`));

      // Check that only first class-row is visible
      await waitFor(() => {
        classes.forEach(({ id, finances }, i) => {
          if (i === 0) {
            expectRowProperties(finances, id);
            expect(getByTestId(`row-${id}`).classList.contains('class')).toBeTruthy();
          }
          if (i !== 0) {
            expect(queryByTestId(`row-${id}`)).toBeNull();
          }
        });
      });

      // Check that projects that belong directly to the selected class are visible
      const projectsForClassWithoutGroup = projects.filter(
        (p) => p.projectClass === classId && !p.projectLocation && !p.projectGroup,
      );

      await waitFor(() => {
        projectsForClassWithoutGroup.forEach((p) =>
          expect(getByTestId(`row-${p.id}-parent-${classId}`)).toBeInTheDocument(),
        );
      });

      const subClassesForClass = subClasses.filter((c) => c.parent === classId);

      // Check that all subClass-rows are visible
      subClassesForClass.forEach(({ id }) => expect(getByTestId(`row-${id}`)).toBeInTheDocument());

      // Click the first subClass row
      const { id: subClassId } = subClassesForClass[0];
      await user.click(getByTestId(`expand-${subClassId}`));

      // Check that only first subClass-row is visible
      await waitFor(() => {
        subClasses.forEach(({ id, finances }, i) => {
          if (i === 0) {
            expectRowProperties(finances, id);
            expect(getByTestId(`row-${id}`).classList.contains('subClass')).toBeTruthy();
          }
          if (i !== 0) {
            expect(queryByTestId(`row-${id}`)).toBeNull();
          }
        });
      });

      // Check that groups that belong directly to the selected subClass are visible
      const groupsForSubClass = mockGroups.data.filter(
        (g) => g.classRelation === subClassId && !g.locationRelation,
      );

      await waitFor(() => {
        groupsForSubClass.forEach(({ id, finances }) => {
          expectRowProperties(finances, id, true);
          expect(getByTestId(`row-${id}`).classList.contains('group')).toBeTruthy();
        });
      });

      // Check that projects that belong directly to the selected subClass are visible
      const projectsForSubClassWithoutGroup = projects.filter(
        (p) => p.projectClass === subClassId && !p.projectLocation && !p.projectGroup,
      );

      await waitFor(() => {
        projectsForSubClassWithoutGroup.forEach(({ id }) =>
          expect(getByTestId(`row-${id}-parent-${subClassId}`)).toBeInTheDocument(),
        );
      });

      const districtsForSubClass = districts.filter((c) => c.parentClass === subClassId);

      // // Check that all district-rows are visible and they have the 'district-preview' class
      districtsForSubClass.forEach(({ id }) => {
        expect(getByTestId(`row-${id}`)).toBeInTheDocument();
        expect(getByTestId(`row-${id}`).classList.contains('districtPreview')).toBeTruthy();
      });

      // Click the first district row
      const { id: districtId } = districtsForSubClass[0];
      await user.click(getByTestId(`expand-${districtId}`));

      // Check that only first district-row is visible
      await waitFor(() => {
        districts.forEach(({ id, finances }, i) => {
          if (i === 0) {
            expectRowProperties(finances, id);
            expect(getByTestId(`row-${id}`).classList.contains('district')).toBeTruthy();
            expect(
              getByTestId(`row-${districtId}`).classList.contains('districtPreview'),
            ).toBeFalsy();
          }
          if (i !== 0) {
            expect(queryByTestId(`row-${id}`)).toBeNull();
          }
        });
      });

      // Check that groups that belong directly to the selected district are visible
      const groupsForDistrict = mockGroups.data.filter((g) => g.locationRelation === districtId);

      await waitFor(() => {
        groupsForDistrict.forEach(({ id }) => {
          expect(getByTestId(`row-${id}`).classList.contains('group')).toBeTruthy();
        });
      });

      //Check that projects that belong directly to the selected district are visible
      const projectsForDistrictWithoutGroup = projects.filter(
        (p) => p.projectLocation === districtId && !p.projectGroup,
      );

      await waitFor(() => {
        projectsForDistrictWithoutGroup.forEach(({ id }) =>
          expect(getByTestId(`row-${id}-parent-${districtId}`)).toBeInTheDocument(),
        );
      });

      // Divisions should be expanded by default and render all their children
      const divisionsForDistrict = divisions.filter((d) => d.parent === districtId);

      await waitFor(() => {
        divisionsForDistrict.forEach(({ id }) => {
          const divisionId = id;
          expect(getByTestId(`row-${divisionId}`)).toBeInTheDocument();
          expect(getByTestId(`row-${divisionId}`).classList.contains('division')).toBeTruthy();

          //Check that projects that belong directly to each division are visible
          const projectsForDivision = projects.filter(
            (p) => p.projectLocation === divisionId && !p.projectGroup,
          );

          projectsForDivision.forEach(({ id }) =>
            expect(getByTestId(`row-${id}-parent-${divisionId}`)).toBeInTheDocument(),
          );
        });
      });

      // Check that groups that belong directly to the selected district are visible
      const groupsForDivision = groups.filter((g) => g.locationRelation === divisions[0].id);

      await waitFor(() => {
        groupsForDivision.forEach(({ id }) => {
          expect(getByTestId(`row-${id}`).classList.contains('group')).toBeTruthy();
        });
      });

      // Click the first group row
      const { id: groupId } = groupsForDivision[0];
      await user.click(getByTestId(`expand-${groupId}`));

      // Check that projects that belong directly to opened group are visible
      const projectsForGroup = projects.filter((p) => p.projectGroup === groupId);

      await waitFor(() => {
        projectsForGroup.forEach(({ id }) =>
          expect(getByTestId(`row-${id}-parent-${groupId}`)).toBeInTheDocument(),
        );
      });
    });

    it('can click expand button to show and hide children and does not bring back all parent rows when re-clicked', async () => {
      const { store, getByTestId, queryByTestId, user } = await render();

      const { masterClasses, classes } = store.getState().class.planning;

      const classesForMasterClass = classes.filter((c) => c.parent === masterClasses[0].id);

      // Classes are hidden at first
      masterClasses.forEach((c) => expect(getByTestId(`row-${c.id}`)).toBeInTheDocument());
      classesForMasterClass.forEach((c) => expect(queryByTestId(`row-${c.id}`)).toBeNull());

      // Click expand button
      await user.click(getByTestId(`expand-${masterClasses[0].id}`));

      // Classes are visible
      classesForMasterClass.forEach((c) => expect(getByTestId(`row-${c.id}`)).toBeInTheDocument());

      // Only clicked masterClass is visible
      masterClasses.forEach((c, i) => {
        if (i === 0) {
          expect(getByTestId(`row-${c.id}`)).toBeInTheDocument();
        } else {
          expect(queryByTestId(`row-${c.id}`)).toBeNull();
        }
      });

      // Click the expand button
      await user.click(getByTestId(`expand-${masterClasses[0].id}`));

      // Classes are hidden again
      classesForMasterClass.forEach((c) => expect(queryByTestId(`row-${c.id}`)).toBeNull());

      // Only clicked masterClass is still visible
      masterClasses.forEach((c, i) => {
        if (i === 0) {
          expect(getByTestId(`row-${c.id}`)).toBeInTheDocument();
        } else {
          expect(queryByTestId(`row-${c.id}`)).toBeNull();
        }
      });
    });
  });

  describe('PlanningRow', () => {
    describe('PlanningForecastSums', () => {
      it('renders all the elements and 0 sums until SAP data is received from the backend ', async () => {
        const { findByTestId, user, store } = await render();
        const year = new Date().getFullYear();
        const { id } = store.getState().class.planning.masterClasses[0];
        await user.click(await findByTestId(`expand-monthly-view-button-${year}`));

        await waitFor(async () => {
          expect(await findByTestId(`planning-forecast-sums-${id}`)).toBeInTheDocument();
          expect(await findByTestId(`planning-forecast-implemented-${id}`)).toHaveTextContent('0');
          expect(await findByTestId(`planning-forecast-bound-${id}`)).toHaveTextContent('0');
        });
      });
    }),
      it('renders head and cells', async () => {
        const { store, getByTestId } = await render();

        const { id } = store.getState().class.planning.masterClasses[0];

        const currentCells = getByTestId(`row-${id}`).children;

        expect(getByTestId(`row-${id}`)).toBeInTheDocument();
        expect(getByTestId(`head-${id}`)).toBeInTheDocument();

        // Loop through the cells
        Array.from(currentCells).forEach((c, i) => {
          // Ignore the head
          if (c.tagName !== 'TH') {
            const year = new Date().getFullYear() + i - 1;
            expect(getByTestId(`cell-${id}-${year}`)).toBeInTheDocument();
          }
        });
      });

    it('can click expand button or title to expand and hide children but doesnt navigate back', async () => {
      const { store, getByTestId, queryByTestId, user } = await render();
      const { masterClasses, classes } = store.getState().class.planning;

      const { id: masterClassId } = masterClasses[0];
      const { id: classId } = classes[0];

      await user.click(getByTestId(`expand-${masterClassId}`));

      expect(getByTestId('masterClass-breadcrumb')).toBeInTheDocument();
      expect(getByTestId(`row-${classId}`)).toBeInTheDocument();

      await user.click(getByTestId(`title-${masterClassId}`));

      expect(getByTestId('masterClass-breadcrumb')).toBeInTheDocument();
      expect(queryByTestId(`row-${classId}`)).toBeNull();
    });

    describe('PlanningHead', () => {
      it('renders all elements', async () => {
        const { store, getByTestId } = await render();

        const { id } = store.getState().class.planning.masterClasses[0];

        // Expand button
        expect(getByTestId(`expand-${id}`)).toBeInTheDocument();
        // Show more button
        expect(getByTestId(`show-more-${id}`)).toBeInTheDocument();
        // Title
        expect(getByTestId(`title-${id}`)).toBeInTheDocument();
      });
    });

    describe('PlanningCell', () => {
      it('renders budget, overrun and deviation', async () => {
        const { store, getByTestId, findByTestId } = await render();

        const { id, finances } = store.getState().class.planning.masterClasses[0];

        const year = new Date().getFullYear();

        const cells = calculatePlanningCells(finances, 'class');

        const { plannedBudget, frameBudget, deviation } = cells[0];

        expect(
          (await findByTestId(`edit-framed-budget-${id}-${year}`)).children[0].children.length,
        ).toBe(3);

        expect(getByTestId(`planned-budget-${id}-${year}`).textContent).toBe(plannedBudget || '0');
        expect(getByTestId(`frame-budget-${id}-${year}`).textContent).toBe(frameBudget || '0');
        expect(getByTestId(`deviation-${id}-${year}`).textContent).toBe(deviation || '0');
      });
    });

    describe('HoverTooltip', () => {
      it('Is hidden by default and displays the current rows title on hover', async () => {
        const { store, findByTestId, user } = await render();

        const { name, id } = store.getState().class.planning.masterClasses[0];
        const rowTitle = await findByTestId(`title-${id}`);
        const hoverTooltip = await findByTestId(`hover-tooltip-undefined`);

        expect(hoverTooltip).not.toBeVisible();

        await waitFor(async () => {
          await user.hover(rowTitle.children[0]);
        });

        expect(hoverTooltip).toBeVisible();
        expect(hoverTooltip).toHaveTextContent(name);

        await user.unhover(rowTitle);

        expect(hoverTooltip).not.toBeVisible();
      });
    });

    describe('ProjectRow', () => {
      it('renders all the elements and the row budgets to rows that have either est-dates or planningStartYear or constructionEndYear, and no financial data to cells if there is no planning or construction', async () => {
        const renderResult = await render();

        const { findByTestId } = renderResult;
        const project = mockPlanningViewProjects.data.results[0];
        const { id, category, name, finances } = project;

        await navigateToProjectRows(renderResult);

        await waitFor(async () => {
          expect(await findByTestId(`row-${id}-parent-test-class-1`)).toBeInTheDocument();
          expect(await findByTestId(`head-${id}`)).toBeInTheDocument();
          expect(await findByTestId(`edit-phase-${id}`)).toBeInTheDocument();
          expect(await findByTestId(`navigate-${id}`)).toHaveTextContent(name);
          expect(await findByTestId(`category-${id}`)).toHaveTextContent(
            (category as IListItem).value,
          );

          const { availableFrameBudget, costEstimateBudget } = calculateProjectRowSums(project);

          expect(await findByTestId(`available-frame-budget-${id}`)).toHaveTextContent(
            availableFrameBudget,
          );
          expect(await findByTestId(`cost-estimate-budget-${id}`)).toHaveTextContent(
            costEstimateBudget,
          );

          for (let i = 0; i < 10; i++) {
            const year = finances.year + i;
            expect(await findByTestId(`project-cell-${year}-${id}`)).toBeInTheDocument();
            if (i === 0 || i === 9 || i === 10) {
              expect(await findByTestId(`cell-input-${year}-${id}`)).toHaveAttribute('readonly');
            }
          }
        });
      });

      it('doesnt render the project category if there is no category', async () => {
        const renderResult = await render();
        const { queryByTestId } = renderResult;

        const { id } = mockPlanningViewProjects.data.results[1];

        await navigateToProjectRows(renderResult);

        expect(queryByTestId(`category-${id}`)).toBeNull();
      });

      it('can patch the project phase with the custom context menu', async () => {
        const project = mockPlanningViewProjects.data.results[1];
        const phasesAsOptions = mockProjectPhases.data.map((p) => listItemToOption(p));
        const preferredPhaseLabel = 'draftInitiation';
        const targetPhaseOption =
          phasesAsOptions.find((option) => option.label === preferredPhaseLabel) ??
          phasesAsOptions.find((option) => option.value !== project.phase?.id) ??
          phasesAsOptions[0];
        const targetPhase =
          mockProjectPhases.data.find((phase) => phase.id === targetPhaseOption.value) ??
          mockProjectPhases.data[0];

        const mockPatchPhaseResponse = {
          data: {
            ...project,
            phase: targetPhase,
          },
        };

        mockedAxios.patch.mockResolvedValueOnce(mockPatchPhaseResponse);

        const renderResult = await render();

        const { user, findByTestId, findByText, queryByTestId, store } = renderResult;

        await navigateToProjectRows(renderResult);

        addProjectUpdateEventListener(store.dispatch);

        const { id } = project;
        const targetOptionValue = targetPhaseOption.value;

        const getProjectFromStore = () =>
          store.getState().planning.projects.find(({ id: projectId }) => projectId === id);

        await waitFor(() => {
          expect(getProjectFromStore()).toBeTruthy();
        });

        const projectFromStore = getProjectFromStore();

        if (!projectFromStore) {
          throw new Error('Project not found in store');
        }

        const projectWithRequiredFields = {
          ...projectFromStore,
          category: projectFromStore.category ?? mockProject.data.category,
        };

        await sendProjectUpdateEvent(projectWithRequiredFields);

        await waitFor(() => {
          expect(getProjectFromStore()?.category).toBeTruthy();
        });

        // Open context menu for phase
        await user.click(await findByTestId(`edit-phase-${id}`));

        // Context menu is visible
        expect(await findByTestId('project-phase-menu')).toBeInTheDocument();

        // All options are visible
        phasesAsOptions.forEach(async (p) =>
          expect(await findByText(`option.${p.label}`)).toBeInTheDocument(),
        );

        // Click first option
        await user.click(await findByTestId(`select-${targetOptionValue}`));

        // First option is selected
        expect(
          (await findByTestId(`project-phase-menu-option-${targetOptionValue}`)).classList.contains(
            'selected',
          ),
        ).toBeTruthy();

        // Save the option
        await user.click(await findByTestId('patch-project-phase'));

        // Wait for the patch
        await waitFor(() => {
          expect(mockedAxios.patch).toHaveBeenCalled();
        });

        const phasePatchCall = mockedAxios.patch.mock.lastCall ?? [];
        expect(phasePatchCall[0]).toBe(`localhost:4000/projects/${id}/`);

        // Send the project-update event with the updated project
        await sendProjectUpdateEvent(mockPatchPhaseResponse.data);

        // Context menu is hidden after patch
        await waitFor(() => expect(queryByTestId('project-phase-menu')).toBeNull());

        // Open context menu for phase
        await user.click(await findByTestId(`edit-phase-${id}`));

        // Patched option is the selected option

        expect(
          (await findByTestId(`project-phase-menu-option-${targetOptionValue}`)).classList.contains(
            'selected',
          ),
        ).toBeTruthy();

        removeProjectUpdateEventListener(store.dispatch);
      });

      it('creates cells for planning, construction and overlap when the project has planning', async () => {
        const renderResult = await render();

        const { getByTestId } = renderResult;
        const { id, finances } = mockPlanningViewProjects.data.results[1];

        await navigateToProjectRows(renderResult);

        await waitFor(() => {
          for (let i = 0; i < 10; i++) {
            const year = finances.year + i;
            const cell = getByTestId(`project-cell-${year}-${id}`);
            const input = getByTestId(`cell-input-${year}-${id}`);
            if (i === 0 || i >= 7) {
              expect(input).toBeDisabled();
            } else {
              expect(input).not.toBeDisabled();
            }
            // Planning
            if (i === 1) {
              expect(cell.classList.contains('planning')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.budgetProposalCurrentYearPlus1));
            }
            // Planning
            if (i === 2) {
              expect(cell.classList.contains('planning')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.budgetProposalCurrentYearPlus2));
            }
            // Overlap
            if (i === 3) {
              expect(cell.classList.contains('overlap')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.preliminaryCurrentYearPlus3));
            }
            // Construction
            if (i === 4) {
              expect(cell.classList.contains('construction')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.preliminaryCurrentYearPlus4));
            }
            // Construction
            if (i === 5) {
              expect(cell.classList.contains('construction')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.preliminaryCurrentYearPlus5));
            }
            // Construction
            if (i === 6) {
              expect(cell.classList.contains('construction')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.preliminaryCurrentYearPlus6));
            }
          }
        });
      });

      it('can expand the years to view a year summary and monthly data graph about the project and the month can be hovered to highlight', async () => {
        const renderResult = await render();
        const { user, container } = renderResult;
        const year = new Date().getFullYear();
        const months = moment.months();
        const project = mockPlanningViewProjects.data.results[1];
        const containerElement = within(container);
        const planningTable = within(await containerElement.findByTestId('planning-table'));

        const getMonthlyBar = async (
          type: 'planning' | 'construction',
          month: string,
          viewIndex = 0,
        ) => {
          const testId = `monthly-${type}-bar-${project.id}-${month}`;
          const bars = await planningTable.findAllByTestId(testId);
          expect(bars.length).toBeGreaterThan(viewIndex);
          return bars[viewIndex];
        };

        const assertMonthlyCellsRendered = async () => {
          for (const month of months) {
            const cells = await planningTable.findAllByTestId(
              `project-monthly-graph-cell-${project.id}-${month}`,
            );
            expect(cells.length).toBeGreaterThan(0);
          }
        };

        await navigateToProjectRows(renderResult);

        await user.click(await containerElement.findByTestId(`expand-monthly-view-button-${year}`));

        expect(await containerElement.findByTestId(`project-year-summary-${project.id}`));

        for (const month of months) {
          const planningBar = await getMonthlyBar('planning', month);
          const constructionBar = await getMonthlyBar('construction', month);

          expect(getComputedStyle(planningBar).width).toBe('0%');
          expect(getComputedStyle(constructionBar).width).toBe('0%');
        }
        await assertMonthlyCellsRendered();

        await user.click(
          await containerElement.findByTestId(`expand-monthly-view-button-${year + 1}`),
        );

        for (const [index, month] of months.entries()) {
          const planningBar = await getMonthlyBar('planning', month, 1);
          const constructionBar = await getMonthlyBar('construction', month, 1);

          expect(getComputedStyle(constructionBar).width).toBe('0%');

          if (index === 0) {
            expect(getComputedStyle(planningBar).width).toBe('0%');
          } else if (index === 1) {
            expect(getComputedStyle(planningBar).width).toBe('57%');
          } else {
            expect(getComputedStyle(planningBar).width).toBe('100%');
          }
        }
        await assertMonthlyCellsRendered();

        const aprilCurrentYearClass = hoverClassName(year, months[3]);
        const aprilNextYearClass = hoverClassName(year + 1, months[3]);
        const aprilCurrentYearElements = container.getElementsByClassName(aprilCurrentYearClass);
        const aprilNextYearElements = container.getElementsByClassName(aprilNextYearClass);
        const expectHoverState = (elements: HTMLCollectionOf<Element>, hovered: boolean) => {
          Array.from(elements).forEach((element) => {
            expect(element.classList.contains('hovered')).toBe(hovered);
          });
        };

        expectHoverState(aprilCurrentYearElements, false);
        expectHoverState(aprilNextYearElements, false);

        const monthlyGraphCells = await planningTable.findAllByTestId(
          `project-monthly-graph-cell-${project.id}-${months[3]}`,
        );
        expect(monthlyGraphCells).toHaveLength(2);

        await user.hover(monthlyGraphCells[0]);
        expectHoverState(aprilCurrentYearElements, true);
        expectHoverState(aprilNextYearElements, false);

        await user.unhover(monthlyGraphCells[0]);
        await user.hover(monthlyGraphCells[1]);
        expectHoverState(aprilCurrentYearElements, false);
        expectHoverState(aprilNextYearElements, true);
      });

      describe('ProjectCell', () => {
        it('active project cells can be edited and patched and the initial 0 value will be replaced by user input', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();

          const patchRequest = {
            finances: { year: year, budgetProposalCurrentYearPlus1: '40' },
          };

          const mockEditCellPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchRequest.finances,
              },
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockEditCellPatchResponse);

          const renderResult = await render();

          const { user, getByTestId } = renderResult;
          const { id } = project;

          await navigateToProjectRows(renderResult);

          const input = await waitFor(() => getByTestId(`cell-input-${year + 1}-${id}`));

          await user.click(input);
          await user.type(input, '40');
          await user.click(getByTestId(`cell-input-${year}-${id}`));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual({
              finances: { year: year, budgetProposalCurrentYearPlus1: 40 },
            });
            expect(input).toHaveValue(
              asNumber(patchRequest.finances.budgetProposalCurrentYearPlus1),
            );
          });
        });

        it('can open the project cell menu and delete a cell in the middle to hide it from the timeline and moves the current sum to the next avaliable cell', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();

          const patchRequest = {
            finances: {
              year: year,
              preliminaryCurrentYearPlus5: '110',
              preliminaryCurrentYearPlus4: null,
            },
          };

          const mockDeleteCellPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchRequest.finances,
              },
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockDeleteCellPatchResponse);

          const renderResult = await render();

          const {
            user,
            findByTestId,
            store: { dispatch },
          } = renderResult;

          addProjectUpdateEventListener(dispatch);

          const { id, name } = project;
          const yearToHide = year + 4;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(yearToHide, id, renderResult);

          expect(await findByTestId('project-cell-menu')).toBeInTheDocument();
          expect(await findByTestId('close-project-cell-menu')).toBeInTheDocument();
          expect(await findByTestId('cell-year')).toHaveTextContent(yearToHide.toString());
          expect(await findByTestId('cell-title')).toHaveTextContent(name);
          expect(
            (await findByTestId('cell-type-construction')).classList.contains('selected'),
          ).toBeTruthy();
          expect(await findByTestId('cell-type-planning')).toBeInTheDocument();

          // Delete cell
          await user.click(await findByTestId('remove-year-button'));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchRequest);
          });

          // Send the project-update event with the updated project
          await sendProjectUpdateEvent(mockDeleteCellPatchResponse.data);

          await waitFor(async () => {
            // Cell is hidden
            const cellInput = await findByTestId(`cell-input-${yearToHide}-${id}`);
            expect(cellInput.hasAttribute('readonly')).toBeTruthy();
            expect(
              (await findByTestId(`project-cell-${yearToHide}-${id}`)).classList.contains('none'),
            ).toBeTruthy();
            // Next cell is still construction in the document
            const nextCell = await findByTestId(`project-cell-${yearToHide + 1}-${id}`);
            expect(nextCell.classList.contains('construction')).toBeTruthy();
          });

          removeProjectUpdateEventListener(dispatch);
        });

        it('can delete the start and end of the timeline to decrease the planning or construction dates', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();
          const updatedConstructionYear = year + 5;

          const updatedEstConstructionEnd = updateYear(
            updatedConstructionYear,
            project.estConstructionEnd,
          );

          const patchConstructionEndRequest = {
            finances: {
              year: year,
              preliminaryCurrentYearPlus5: '130',
              preliminaryCurrentYearPlus6: '0',
            },
            estConstructionEnd: updatedEstConstructionEnd,
            constructionEndYear: updatedConstructionYear,
          };

          const mockRemoveConstructionEndPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchConstructionEndRequest.finances,
              },
              estConstructionEnd: updatedEstConstructionEnd,
              constructionEndYear: updatedConstructionYear,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockRemoveConstructionEndPatchResponse);

          const renderResult = await render();

          const {
            user,
            findByTestId,
            store: { dispatch },
          } = renderResult;

          addProjectUpdateEventListener(dispatch);

          const { id } = project;
          const endOfTimeline = year + 6;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(endOfTimeline, id, renderResult);
          await user.click(await findByTestId('remove-year-button'));

          // Check that correct data was patched and construction end date has moved
          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchConstructionEndRequest);
          });

          // Send the project-update event with the updated project
          await sendProjectUpdateEvent(mockRemoveConstructionEndPatchResponse.data);

          await waitFor(async () => {
            const endCellInput = await findByTestId(`cell-input-${endOfTimeline}-${id}`);
            expect(endCellInput).toHaveAttribute('readonly');
            expect(endCellInput).toHaveValue(null);
          });

          const startOfTimeline = year + 1;

          const updatedPlanningYear = year + 2;

          const patchPlanningStartRequest = {
            finances: {
              year: year,
              budgetProposalCurrentYearPlus1: '0',
              budgetProposalCurrentYearPlus2: '30',
            },
            estPlanningStart: updateYear(updatedPlanningYear, project.estPlanningStart),
            planningStartYear: updatedPlanningYear,
          };

          const mockRemovePlanningStartPatchResponse = {
            data: {
              ...project,
              ...patchPlanningStartRequest,
              finances: {
                ...project.finances,
                ...patchPlanningStartRequest.finances,
              },
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockRemovePlanningStartPatchResponse);

          await openContextMenuForCell(startOfTimeline, id, renderResult);
          await user.click(await findByTestId('remove-year-button'));

          // Check that correct data was patched and planning start has moved
          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchPlanningStartRequest);
          });

          // Send the project-update event with the updated project
          await sendProjectUpdateEvent(mockRemovePlanningStartPatchResponse.data);

          // Check that correct data was patched and planning start has moved
          await waitFor(async () => {
            const startCellInput = await findByTestId(`cell-input-${startOfTimeline}-${id}`);
            expect(startCellInput).toHaveAttribute('readonly');
            expect(startCellInput).toHaveValue(0);
          });

          removeProjectUpdateEventListener(dispatch);
        });

        it('it removes construction end and start dates if last construction cell is removed and move construction end year to planning start if its not the last cell', async () => {
          const project = mockPlanningViewProjects.data.results[8];
          const year = new Date().getFullYear();

          const patchLastConRequest = {
            finances: {
              year: year,
              preliminaryCurrentYearPlus3: '0',
            },
            constructionEndYear: project.planningStartYear,
            estConstructionEnd: null,
            estConstructionStart: null,
          };

          const mockRemoveLastConPatchResponse = {
            data: {
              ...project,
              ...patchLastConRequest,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockRemoveLastConPatchResponse);

          const renderResult = await render();

          const { user, findByTestId } = renderResult;
          const { id } = project;
          const lastConYear = year + 3;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(lastConYear, id, renderResult);
          await user.click(await findByTestId('remove-year-button'));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-9/');
            expect(patchMock[1]).toStrictEqual(patchLastConRequest);
          });
        });

        it('it removes planning and construction end and start dates and years if last overlap cell is removed', async () => {
          const project = mockPlanningViewProjects.data.results[10];
          const year = new Date().getFullYear();

          const patchLastOverlapRequest = {
            finances: {
              year: year,
              preliminaryCurrentYearPlus3: '0',
            },
            estConstructionStart: null,
            estConstructionEnd: null,
            estPlanningStart: null,
            estPlanningEnd: null,
            planningStartYear: null,
            constructionEndYear: null,
          };

          const mockRemoveLastOverlapPatchResponse = {
            data: {
              ...project,
              ...patchLastOverlapRequest,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockRemoveLastOverlapPatchResponse);

          const renderResult = await render();

          const { user, findByTestId } = renderResult;
          const { id } = project;
          const lastOverlapYear = year + 3;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(lastOverlapYear, id, renderResult);
          await user.click(await findByTestId('remove-year-button'));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-11/');
            expect(patchMock[1]).toStrictEqual(patchLastOverlapRequest);
          });
        });

        it('can add a year to construction and replaces the budgets null value with 0', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();
          const updatedConstructionEndYear = year + 7;

          const patchAddConYearRequest = {
            finances: { year: year, preliminaryCurrentYearPlus7: '0' },
            estConstructionEnd: updateYear(updatedConstructionEndYear, project.estConstructionEnd),
            constructionEndYear: updatedConstructionEndYear,
          };

          const mockAddConYearPatchResponse = {
            data: {
              ...project,
              ...patchAddConYearRequest,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockAddConYearPatchResponse);

          const renderResult = await render();

          const { user, findByTestId } = renderResult;
          const { id } = project;
          const constructionEndYear = year + 6;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(constructionEndYear, id, renderResult);
          await user.click(await findByTestId('edit-year-button'));

          const addYearButton = await findByTestId(`add-cell-${constructionEndYear}-${id}-right`);
          expect(addYearButton).toBeVisible();

          await user.click(addYearButton);

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchAddConYearRequest);
          });
        });

        it('can add a year to planning', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();
          const updatedPlanningStartYear = year;

          const patchAddPlanYearRequest = {
            finances: { year },
            estPlanningStart: updateYear(updatedPlanningStartYear, project.estPlanningStart),
            planningStartYear: updatedPlanningStartYear,
          };

          const mockAddConYearPatchResponse = {
            data: {
              ...project,
              ...patchAddPlanYearRequest,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockAddConYearPatchResponse);

          const renderResult = await render();

          const { user, findByTestId } = renderResult;
          const { id } = project;
          const planningStartYear = year + 1;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(planningStartYear, id, renderResult);
          await user.click(await findByTestId('edit-year-button'));

          const addYearButton = await findByTestId(`add-cell-${planningStartYear}-${id}-left`);

          await user.click(addYearButton);

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchAddPlanYearRequest);
          });
        });

        it('can add a year to planning if an overlap cell is selected', async () => {
          const project = mockPlanningViewProjects.data.results[10];
          const year = new Date().getFullYear();
          const updatedPlanningStartYear = year + 2;

          const patchAddOverlapPlanRequest = {
            finances: { year },
            estPlanningStart: updateYear(updatedPlanningStartYear, project.estPlanningStart),
            planningStartYear: updatedPlanningStartYear,
          };

          const mockAddOverlapPlanPatchResponse = {
            data: {
              ...project,
              ...patchAddOverlapPlanRequest,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockAddOverlapPlanPatchResponse);

          const renderResult = await render();

          const { user, findByTestId } = renderResult;
          const { id } = project;
          const overlapYear = year + 3;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(overlapYear, id, renderResult);
          await user.click(await findByTestId('edit-year-button'));

          const addYearButton = await findByTestId(`add-cell-${overlapYear}-${id}-left`);

          await user.click(addYearButton);

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-11/');
            expect(patchMock[1]).toStrictEqual(patchAddOverlapPlanRequest);
          });
        });

        it('can add a year to construction if an overlap cell is selected', async () => {
          const project = mockPlanningViewProjects.data.results[10];
          const year = new Date().getFullYear();

          const updatedConstructionEndYear = year + 4;

          const patchAddOverlapConRequest = {
            finances: { year },
            estConstructionEnd: updateYear(updatedConstructionEndYear, project.estConstructionEnd),
            constructionEndYear: updatedConstructionEndYear,
          };

          const mockAddOverlapConPatchResponse = {
            data: {
              ...project,
              ...patchAddOverlapConRequest,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockAddOverlapConPatchResponse);

          const renderResult = await render();

          const { user, findByTestId } = renderResult;
          const { id } = project;
          const overlapYear = year + 3;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(overlapYear, id, renderResult);

          await user.click(await findByTestId('edit-year-button'));

          const addYearButton = await findByTestId(`add-cell-${overlapYear}-${id}-right`);

          await user.click(addYearButton);

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-11/');
            expect(patchMock[1]).toStrictEqual(patchAddOverlapConRequest);
          });
        });

        it('moves planning end and construction start if an overlapping planning cell is deleted', async () => {
          const project = mockPlanningViewProjects.data.results[11];
          const year = new Date().getFullYear();
          const updatedYear = year + 4;

          const deleteOverlapPlanRequest = {
            estPlanningStart: updateYear(updatedYear, project.estPlanningStart),
            estPlanningEnd: updateYear(updatedYear, project.estPlanningEnd),
            estConstructionStart: updateYear(updatedYear, project.estConstructionStart),
            planningStartYear: updatedYear,
            finances: {
              preliminaryCurrentYearPlus3: '0',
              preliminaryCurrentYearPlus4: '0',
              year,
            },
          };

          const mockDeleteOverlapPlanPatchResponse = {
            data: {
              ...project,
              ...deleteOverlapPlanRequest,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockDeleteOverlapPlanPatchResponse);

          const renderResult = await render();

          const { user, findByTestId } = renderResult;
          const { id } = project;
          const overlapYear = year + 3;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(overlapYear, id, renderResult);
          await user.click(await findByTestId('remove-year-button'));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-12/');
            expect(patchMock[1]).toStrictEqual(deleteOverlapPlanRequest);
          });
        });

        it('can increase the whole timeline by one year with double clicking ', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();

          const updatedPlanningStartYear = year + 2;
          const updatedConstructionEndYear = year + 7;

          const patchMoveYearRequest = {
            finances: {
              year: year,
              budgetProposalCurrentYearPlus0: '0',
              budgetProposalCurrentYearPlus1: '0.00',
              budgetProposalCurrentYearPlus2: '0.00',
              preliminaryCurrentYearPlus3: '30.00',
              preliminaryCurrentYearPlus4: '40.00',
              preliminaryCurrentYearPlus5: '50.00',
              preliminaryCurrentYearPlus6: '60.00',
              preliminaryCurrentYearPlus7: '70.00',
              preliminaryCurrentYearPlus8: null,
              preliminaryCurrentYearPlus9: '90.00',
              preliminaryCurrentYearPlus10: '0.00',
            },
            estPlanningStart: updateYear(updatedPlanningStartYear, project.estPlanningStart),
            estPlanningEnd: updateYear(year + 4, project.estPlanningEnd),
            estConstructionStart: updateYear(year + 4, project.estConstructionStart),
            estConstructionEnd: updateYear(updatedConstructionEndYear, project.estConstructionEnd),
            planningStartYear: updatedPlanningStartYear,
            constructionEndYear: updatedConstructionEndYear,
          };

          const mockMoveYearPatchResponse = {
            data: {
              ...project,
              ...patchMoveYearRequest,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockMoveYearPatchResponse);

          const renderResult = await render();

          const { user, findByTestId } = renderResult;
          const { id } = project;
          const constructionEndYear = year + 6;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(constructionEndYear, id, renderResult);
          await user.click(await findByTestId('edit-year-button'));

          const addYearButton = await findByTestId(`add-cell-${constructionEndYear}-${id}-right`);
          expect(addYearButton).toBeVisible();

          await user.dblClick(addYearButton);

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchMoveYearRequest);
          });
        });

        it('can decrease the whole timeline by one year with double clicking ', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();

          const updatedPlanningStartYear = year;
          const updatedConstructionEndYear = year + 5;

          const patchMoveYearRequest = {
            finances: {
              year: year,
              budgetProposalCurrentYearPlus0: '0.00',
              budgetProposalCurrentYearPlus1: '30.00',
              budgetProposalCurrentYearPlus2: '40.00',
              preliminaryCurrentYearPlus3: '50.00',
              preliminaryCurrentYearPlus4: '60.00',
              preliminaryCurrentYearPlus5: '70.00',
              preliminaryCurrentYearPlus6: null,
              preliminaryCurrentYearPlus7: '90.00',
              preliminaryCurrentYearPlus8: '0.00',
              preliminaryCurrentYearPlus9: '0.00',
              preliminaryCurrentYearPlus10: '0',
            },
            estPlanningStart: updateYear(updatedPlanningStartYear, project.estPlanningStart),
            estPlanningEnd: updateYear(year + 2, project.estPlanningEnd),
            estConstructionStart: updateYear(year + 2, project.estConstructionStart),
            estConstructionEnd: updateYear(updatedConstructionEndYear, project.estConstructionEnd),
            planningStartYear: updatedPlanningStartYear,
            constructionEndYear: updatedConstructionEndYear,
          };

          const mockMoveYearPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchMoveYearRequest.finances,
              },
              estConstructionEnd: patchMoveYearRequest.estConstructionEnd,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockMoveYearPatchResponse);

          const renderResult = await render();

          const { user, findByTestId } = renderResult;
          const { id } = project;
          const planningStartYear = year + 1;

          await navigateToProjectRows(renderResult);
          await openContextMenuForCell(planningStartYear, id, renderResult);
          await user.click(await findByTestId('edit-year-button'));

          const addYearButton = await findByTestId(`add-cell-${planningStartYear}-${id}-left`);
          expect(addYearButton).toBeVisible();

          await user.dblClick(addYearButton);

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchMoveYearRequest);
          });
        });

        it('can edit groups using context menu', async () => {
          const { store, user, findByTestId, findByRole, findAllByTestId, queryByTestId } =
            await render();
          addProjectUpdateEventListener(store.dispatch);
          const { masterClasses, classes, subClasses } = store.getState().class.planning;

          const projects = mockPlanningViewProjects.data.results;

          const expectRowProperties = async (
            finances: IClassFinances,
            id: string,
            isGroup?: boolean,
          ) => {
            const { plannedBudgets, costEstimateBudget, deviation } = calculatePlanningRowSums(
              finances,
              isGroup ? 'group' : 'class',
            );

            expect(await findByTestId(`row-${id}`)).toBeInTheDocument();
            expect((await findByTestId(`planned-budgets-${id}`)).textContent).toBe(plannedBudgets);
            expect((await findByTestId(`cost-estimate-budget-${id}`)).textContent).toBe(
              costEstimateBudget,
            );
            if (!isGroup) {
              expect((await findByTestId(`deviation-${id}`)).textContent).toBe(deviation);
            }
          };

          // Check that all masterClass-rows is visible
          masterClasses.forEach(async ({ id }) =>
            expect(await findByTestId(`row-${id}`)).toBeInTheDocument(),
          );

          // Click the first masterclass row
          const { id: masterClassId } = masterClasses[0];
          await user.click(await findByTestId(`expand-${masterClassId}`));

          const classesForMasterClass = classes.filter((c) => c.parent === masterClassId);

          // Check that all class-rows are visible
          classesForMasterClass.forEach(async ({ id }) =>
            expect(await findByTestId(`row-${id}`)).toBeInTheDocument(),
          );

          // Click the first class row
          const { id: classId } = classesForMasterClass[0];
          await user.click(await findByTestId(`expand-${classId}`));

          const subClassesForClass = subClasses.filter((c) => c.parent === classId);

          // Check that all subClass-rows are visible
          subClassesForClass.forEach(async ({ id }) =>
            expect(await findByTestId(`row-${id}`)).toBeInTheDocument(),
          );

          // Click the first subClass row
          const { id: subClassId } = subClassesForClass[0];
          await user.click(await findByTestId(`expand-${subClassId}`));

          // Check that groups that belong directly to the selected subClass are visible
          const groupsForSubClass = mockGroups.data.filter(
            (g) => g.classRelation === subClassId && !g.locationRelation,
          );

          await waitFor(() => {
            groupsForSubClass.forEach(async ({ id, finances }) => {
              expectRowProperties(finances, id, true);
              expect((await findByTestId(`row-${id}`)).classList.contains('group')).toBeTruthy();
            });
          });

          const groupId = groupsForSubClass[0].id;

          const ensureGroupExpanded = async () => {
            const expandButton = await findByTestId(`expand-${groupId}`);
            const icon = expandButton.querySelector('svg');
            if (icon?.getAttribute('aria-label') !== 'angle-up') {
              await user.click(expandButton);
            }
          };

          // Check that projects that belong directly to the selected subClass are visible
          const projectsForSubClassWithoutGroup = projects.filter(
            (p) => p.projectClass === subClassId && !p.projectLocation && !p.projectGroup,
          );

          const projectToGroup = projectsForSubClassWithoutGroup[0];

          await waitFor(() => {
            projectsForSubClassWithoutGroup.forEach(async ({ id }) =>
              expect(await findByTestId(`row-${id}-parent-${subClassId}`)).toBeInTheDocument(),
            );
          });

          // Project currently under subclass
          expect(
            await findByTestId(`row-${projectToGroup.id}-parent-${subClassId}`),
          ).toBeInTheDocument();

          // Check show more icon exists on group planning head
          const groupShowMoreIcon = await findByTestId(`show-more-icon-${groupId}`);

          expect(groupShowMoreIcon).toBeInTheDocument();

          // Open context menu
          await user.click(groupShowMoreIcon);

          const groupContextMenu = await findByTestId('group-row-context-menu');

          expect(groupContextMenu).toBeInTheDocument();

          // Wait for dialog to open
          // Also context menu closes
          await user.click(await findByTestId('open-group-edit-dialog'));

          const modal = await findByRole('dialog');
          const groupEditDialog = within(modal);

          expect(await groupEditDialog.findByDisplayValue('Test Group 3')).toBeInTheDocument();
          expect(
            await groupEditDialog.findByText('801 Esirakentmainen (kiinteä omaisuus)'),
          ).toBeInTheDocument();
          expect(await groupEditDialog.findByText('TestClass')).toBeInTheDocument();
          expect(await groupEditDialog.findByText('TestSubClass')).toBeInTheDocument();

          await user.clear(await groupEditDialog.findByDisplayValue('Test Group 3'));
          // Changing group name
          await user.type(await groupEditDialog.findByText('groupForm.name'), 'changed name group');
          // Searching for project
          const mockSuggestionsResponse = {
            data: {
              results: [projectsForSubClassWithoutGroup[0]],
              count: 1,
            },
          };

          mockedAxios.get.mockResolvedValueOnce(mockSuggestionsResponse);
          await waitFor(async () => {
            await user.type(
              await groupEditDialog.findByText('groupForm.searchForProjects'),
              'not-in',
            );
          });

          await waitFor(async () => {
            expect(await groupEditDialog.findByText('not-in-group-project')).toBeInTheDocument();
            // Adding project to the group
            await user.click(await groupEditDialog.findByText('not-in-group-project'));
            // Length is 2 since there is already a project under this group
            expect((await findAllByTestId('project-selections')).length).toBe(2);
          });
          const getRequest = mockedAxios.get.mock;

          const year = new Date().getFullYear();
          // Check that the correct url was called
          expect(getRequest.lastCall[0]).toBe(
            `localhost:4000/projects/?class=test-class-1&inGroup=false&year=${year}&forcedToFrame=false&direct=false&programmed=true`,
          );
          const submitButton = await groupEditDialog.findByTestId('save-group-button');
          expect(submitButton).toBeInTheDocument();
          const patchGroupResponse: { data: IGroup } = {
            data: { ...groupsForSubClass[0], name: 'changed name group' },
          };

          mockedAxios.patch.mockResolvedValueOnce(patchGroupResponse);

          await user.click(submitButton);

          await sendProjectUpdateEvent({
            ...projectsForSubClassWithoutGroup[0],
            projectGroup: groupId,
          });
          await waitFor(() => {
            const updatedProject = store
              .getState()
              .planning.projects.find(({ id }) => id === projectToGroup.id);
            expect(updatedProject?.projectGroup).toBe(groupId);
          });
          // Group title updated
          expect(
            await within(await findByTestId(`title-${groupId}`)).findByText('changed name group'),
          ).toBeInTheDocument();
          await ensureGroupExpanded();

          // Project is now under group balk
          await waitFor(() => {
            expect(queryByTestId(`row-${projectToGroup.id}-parent-${groupId}`)).toBeInTheDocument();
          });

          removeProjectUpdateEventListener(store.dispatch);
        });

        it('can remove groups using context menu', async () => {
          const { store, user, findByTestId, findByRole } = await render();
          addProjectUpdateEventListener(store.dispatch);
          const { masterClasses, classes, subClasses } = store.getState().class.planning;

          const projects = mockPlanningViewProjects.data.results;

          const expectRowProperties = async (
            finances: IClassFinances,
            id: string,
            isGroup?: boolean,
          ) => {
            const { plannedBudgets, costEstimateBudget, deviation } = calculatePlanningRowSums(
              finances,
              isGroup ? 'group' : 'class',
            );

            expect(await findByTestId(`row-${id}`)).toBeInTheDocument();
            expect((await findByTestId(`planned-budgets-${id}`)).textContent).toBe(plannedBudgets);
            expect((await findByTestId(`cost-estimate-budget-${id}`)).textContent).toBe(
              costEstimateBudget,
            );
            if (!isGroup) {
              expect((await findByTestId(`deviation-${id}`)).textContent).toBe(deviation);
            }
          };

          // Check that all masterClass-rows is visible
          masterClasses.forEach(async ({ id }) =>
            expect(await findByTestId(`row-${id}`)).toBeInTheDocument(),
          );

          // Click the first masterclass row
          const { id: masterClassId } = masterClasses[0];
          await user.click(await findByTestId(`expand-${masterClassId}`));

          const classesForMasterClass = classes.filter((c) => c.parent === masterClassId);

          // Check that all class-rows are visible
          classesForMasterClass.forEach(async ({ id }) =>
            expect(await findByTestId(`row-${id}`)).toBeInTheDocument(),
          );

          // Click the first class row
          const { id: classId } = classesForMasterClass[0];
          await user.click(await findByTestId(`expand-${classId}`));

          const subClassesForClass = subClasses.filter((c) => c.parent === classId);

          // Check that all subClass-rows are visible
          subClassesForClass.forEach(async ({ id }) =>
            expect(await findByTestId(`row-${id}`)).toBeInTheDocument(),
          );

          // Click the first subClass row
          const { id: subClassId } = subClassesForClass[0];
          await user.click(await findByTestId(`expand-${subClassId}`));

          // Check that groups that belong directly to the selected subClass are visible
          const groupsForSubClass = mockGroups.data.filter(
            (g) => g.classRelation === subClassId && !g.locationRelation,
          );

          await waitFor(() => {
            groupsForSubClass.forEach(async ({ id, finances }) => {
              expectRowProperties(finances, id, true);
              expect((await findByTestId(`row-${id}`)).classList.contains('group')).toBeTruthy();
            });
          });
          const groupId = groupsForSubClass[0].id;
          // open group balk
          await user.click(await findByTestId(`expand-${groupId}`));
          // Check that projects that belong directly to the selected subClass are visible
          // and are under a group
          const projectsForSubClassWithGroup = projects.filter(
            (p) => p.projectClass === subClassId && p.projectGroup === groupId,
          );

          const projectInGroup = projectsForSubClassWithGroup[0];
          await waitFor(() => {
            projectsForSubClassWithGroup.forEach(async ({ id }) =>
              expect(await findByTestId(`row-${id}-parent-${groupId}`)).toBeInTheDocument(),
            );
          });

          // Project currently under group
          expect(
            await findByTestId(`row-${projectInGroup.id}-parent-${groupId}`),
          ).toBeInTheDocument();

          // Check show more icon exists on group planning head
          const groupShowMoreIcon = await findByTestId(`show-more-icon-${groupId}`);

          expect(groupShowMoreIcon).toBeInTheDocument();
          // Open context menu

          await user.click(groupShowMoreIcon);

          const groupContextMenu = await findByTestId('group-row-context-menu');

          expect(groupContextMenu).toBeInTheDocument();

          // Wait for dialog to open
          // Also context menu closes
          await user.click(await findByTestId('open-delete-group-dialog'));

          const modal = await findByRole('dialog');
          const groupDeleteDialog = within(modal);
          const deleteButton = await groupDeleteDialog.findByTestId(`delete-group-${groupId}`);
          expect(deleteButton).toBeInTheDocument();
          const mockDeleteResponse = {
            data: {
              id: groupId,
            },
          };
          mockedAxios.delete.mockResolvedValueOnce(mockDeleteResponse);
          await user.click(deleteButton);

          await sendProjectUpdateEvent({
            ...projectInGroup,
            projectGroup: null,
          });
          await waitFor(() => {
            const updatedProject = store
              .getState()
              .planning.projects.find(({ id }) => id === projectInGroup.id);
            expect(updatedProject?.projectGroup).toBeNull();
          });

          // Project moved back under subclass
          expect(
            await findByTestId(`row-${projectInGroup.id}-parent-${subClassId}`),
          ).toBeInTheDocument();

          removeProjectUpdateEventListener(store.dispatch);
        });

        it('can open the project cell menu and change cell phase', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();
          // initial years for project planningEnd and construction Start
          const planEndCellYear = year + 3;
          const conStartYearCell = year + 3;
          const mockUpdateCellTypePatchResponse = {
            data: {
              ...project,
              estConstructionStart: `12.02.${conStartYearCell + 1}`,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockUpdateCellTypePatchResponse);

          const patchRequest = {
            finances: { year },
            estConstructionStart: `12.02.${conStartYearCell + 1}`,
          };

          const renderResult = await render();

          const {
            user,
            findByTestId,

            store: { dispatch },
          } = renderResult;

          addProjectUpdateEventListener(dispatch);

          const { id, name } = project;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(planEndCellYear, id, renderResult));

          await waitFor(async () => {
            expect(await findByTestId('project-cell-menu')).toBeInTheDocument();
            expect(await findByTestId('close-project-cell-menu')).toBeInTheDocument();
            expect(await findByTestId('cell-year')).toHaveTextContent(planEndCellYear.toString());
            expect(await findByTestId('cell-title')).toHaveTextContent(name);
            // overlap cells
            const overlapCell = await findByTestId(`project-cell-${planEndCellYear}-${id}`);
            expect(overlapCell.classList.contains('overlap')).toBeTruthy();
            const constructionCell = await findByTestId('cell-type-construction');
            expect(constructionCell.classList.contains('selected')).toBeTruthy();
            const planningCell = await findByTestId('cell-type-planning');
            expect(planningCell.classList.contains('selected')).toBeTruthy();
          });

          // Overlap cells can be changed to either plan or con
          expect(await findByTestId('update-cell-type-to-planning')).toBeEnabled();
          expect(await findByTestId('update-cell-type-to-construction')).toBeEnabled();

          // Updating overlap celltype to plan
          await user.click(await findByTestId('update-cell-type-to-planning'));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchRequest);
          });

          // Send the project-update event with the updated project
          await sendProjectUpdateEvent(mockUpdateCellTypePatchResponse.data);

          await waitFor(async () => {
            // overlap changed to plan
            expect(await findByTestId(`project-cell-${planEndCellYear}-${id}`)).toBeInTheDocument();
            let projectCell = await findByTestId(`project-cell-${planEndCellYear}-${id}`);
            expect(projectCell.classList.contains('planning')).toBeTruthy();
            // moved construction + 1 year forward
            expect(
              await findByTestId(`project-cell-${planEndCellYear + 1}-${id}`),
            ).toBeInTheDocument();
            projectCell = await findByTestId(`project-cell-${planEndCellYear + 1}-${id}`);
            expect(projectCell.classList.contains('construction')).toBeTruthy();
          });

          // opening menu for a cell before the planEnd cell
          await waitFor(() => openContextMenuForCell(planEndCellYear - 1, id, renderResult));

          await waitFor(async () => {
            expect(await findByTestId('cell-year')).toHaveTextContent(
              (planEndCellYear - 1).toString(),
            );
            let projectCell = await findByTestId(`project-cell-${planEndCellYear - 1}-${id}`);
            expect(projectCell.classList.contains('planning')).toBeTruthy();
            projectCell = await findByTestId('cell-type-planning');
            expect(projectCell.classList.contains('selected')).toBeTruthy();
          });

          // Cannot update cells in the middle of timeline
          expect(await findByTestId('update-cell-type-to-planning')).toBeDisabled();
          expect(await findByTestId('update-cell-type-to-construction')).toBeDisabled();

          await user.click(await findByTestId('close-project-cell-menu'));

          const mockUpdateCellTypePatchResponse_2 = {
            data: {
              ...project,
              estConstructionStart: `12.02.${conStartYearCell}`,
              estPlanningEnd: `12.02.${planEndCellYear - 1}`,
            },
          };
          const patchRequest_2 = {
            finances: { year },
            estConstructionStart: `12.02.${conStartYearCell}`,
            estPlanningEnd: `12.02.${planEndCellYear - 1}`,
          };
          mockedAxios.patch.mockResolvedValueOnce(mockUpdateCellTypePatchResponse_2);

          await waitFor(() => openContextMenuForCell(planEndCellYear, id, renderResult));

          await waitFor(async () => {
            expect(await findByTestId('cell-year')).toHaveTextContent(planEndCellYear.toString());
            // plan end cell
            let projectCell = await findByTestId(`project-cell-${planEndCellYear}-${id}`);
            expect(projectCell.classList.contains('planning')).toBeTruthy();
            projectCell = await findByTestId('cell-type-planning');
            expect(projectCell.classList.contains('selected')).toBeTruthy();
          });
          // plan cell cannot be changed to plan
          // only con button enabled
          expect(await findByTestId('update-cell-type-to-planning')).toBeDisabled();
          expect(await findByTestId('update-cell-type-to-construction')).toBeEnabled();

          // Updating celltype to con
          await user.click(await findByTestId('update-cell-type-to-construction'));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchRequest_2);
          });

          // Send the project-update event with the updated project
          await sendProjectUpdateEvent(mockUpdateCellTypePatchResponse_2.data);

          await waitFor(async () => {
            // planEnd moved 1 year back
            // plan cell changed to conStart cell
            expect(
              await findByTestId(`project-cell-${conStartYearCell}-${id}`),
            ).toBeInTheDocument();
            let projectCell = await findByTestId(`project-cell-${conStartYearCell}-${id}`);
            expect(projectCell.classList.contains('construction')).toBeTruthy();

            expect(
              await findByTestId(`project-cell-${conStartYearCell - 1}-${id}`),
            ).toBeInTheDocument();
            projectCell = await findByTestId(`project-cell-${conStartYearCell - 1}-${id}`);
            expect(projectCell.classList.contains('planning')).toBeTruthy();
            removeProjectUpdateEventListener(dispatch);
          });
        });
      });
    });
  });
});
