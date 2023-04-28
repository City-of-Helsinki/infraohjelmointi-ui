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
import { mockDistricts, mockDivisions, mockLocations } from '@/mocks/mockLocations';
import { mockProjectPhases } from '@/mocks/mockLists';
import { mockGroups } from '@/mocks/mockGroups';
import { Route } from 'react-router';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { act, fireEvent, waitFor } from '@testing-library/react';
import mockPlanningViewProjects from '@/mocks/mockPlanningViewProjects';
import { IListItem } from '@/interfaces/common';
import { CustomContextMenu } from '@/components/CustomContextMenu';
import { formatNumber, listItemToOption } from '@/utils/common';
import { mockError } from '@/mocks/mockError';
import { getProjectsWithParams } from '@/services/projectServices';
import { IClassFinances } from '@/interfaces/classInterfaces';
import { IClassBudgets } from '@/interfaces/classInterfaces';
import { calculatePlanningCells, calculatePlanningRowSums } from '@/hooks/usePlanningRows';
import { calculateProjectRowSums } from '@/hooks/useProjectRow';
import { mockClassFinances } from '@/mocks/mockClassFinances';
import { getPlanningRowTitle } from '@/hooks/useSummaryRows';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;
const store = setupStore();

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <Route
        path="/"
        element={
          <>
            <PlanningView />
            <CustomContextMenu />
          </>
        }
      >
        <Route path=":masterClassId" element={<PlanningView />}>
          <Route path=":classId" element={<PlanningView />}>
            <Route path=":subClassId" element={<PlanningView />}>
              <Route path=":districtId" element={<PlanningView />} />
            </Route>
          </Route>
        </Route>
      </Route>,
      {
        preloadedState: {
          class: {
            ...store.getState().class,
            allClasses: mockProjectClasses.data,
            masterClasses: mockMasterClasses.data,
            classes: mockClasses.data,
            subClasses: mockSubClasses.data,
          },
          location: {
            ...store.getState().location,
            allLocations: mockLocations.data,
            districts: mockDistricts.data,
            divisions: mockDivisions.data,
          },
          group: {
            ...store.getState().group,
            groups: mockGroups.data,
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
    const { user, store, getByTestId } = renderResult;
    const { masterClasses, classes } = store.getState().class;
    await user.click(getByTestId(`expand-${masterClasses[0].id}`));
    await user.click(getByTestId(`expand-${classes[0].id}`));
  };

  const openContextMenuForCell = (year: number, id: string, renderResult: CustomRenderResult) => {
    const { getByTestId } = renderResult;
    fireEvent.contextMenu(getByTestId(`project-cell-${year}-${id}`));
  };

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

    await render();

    await waitFor(() => getProjectsWithParams({ params: 'test=123', direct: false }));

    const getMock = mockedAxios.get.mock.lastCall;

    expect(getMock[0]).toBe('localhost:4000/projects/?test=123&direct=false');
  });

  describe('PlanningBreadCrumbs', () => {
    it('renders only first breadcrumb if no table row is expanded', async () => {
      const { getByTestId, queryByTestId, container } = await render();

      expect(container.getElementsByClassName('breadcrumbs-list')[0]).toBeInTheDocument();
      expect(getByTestId('programming-breadcrumb')).toBeInTheDocument();
      expect(queryByTestId('masterClass-breadcrumb')).toBeNull();
      expect(queryByTestId('class-breadcrumb')).toBeNull();
      expect(queryByTestId('subClass-breadcrumb')).toBeNull();
      expect(queryByTestId('district-breadcrumb')).toBeNull();
    });

    it('renders breadcrumbs when table rows are expanded all the way to the selected district and navigates to planning frontpage from first breadcrumb', async () => {
      const { getByTestId, user, store, getAllByTestId, queryByTestId } = await render();

      const { masterClasses, classes, subClasses } = store.getState().class;
      const { districts } = store.getState().location;

      const { id: masterClassId } = masterClasses[0];
      const { id: classId } = classes[0];
      const { id: subClassId } = subClasses[0];
      const { id: districtId } = districts[0];

      await user.click(getByTestId(`expand-${masterClassId}`));
      expect(getByTestId('masterClass-breadcrumb')).toHaveAttribute('href', `/${masterClassId}`);

      await user.click(getByTestId(`expand-${classId}`));
      expect(getByTestId('class-breadcrumb')).toHaveAttribute(
        'href',
        `/${masterClassId}/${classId}`,
      );

      await user.click(getByTestId(`expand-${subClassId}`));
      expect(getByTestId('subClass-breadcrumb')).toHaveAttribute(
        'href',
        `/${masterClassId}/${classId}/${subClassId}`,
      );

      await user.click(getByTestId(`expand-${districtId}`));
      expect(getByTestId('district-breadcrumb')).toHaveAttribute(
        'href',
        `/${masterClassId}/${classId}/${subClassId}/${districtId}`,
      );

      expect(getAllByTestId('breadcrumb-arrow').length).toBe(4);

      await user.click(getByTestId('programming-breadcrumb'));

      expect(queryByTestId('masterClass-breadcrumb')).toBeNull();
      expect(queryByTestId('class-breadcrumb')).toBeNull();
      expect(queryByTestId('subClass-breadcrumb')).toBeNull();
      expect(queryByTestId('district-breadcrumb')).toBeNull();
    });

    it('navigates to the clicked class', async () => {
      const { getByTestId, store, user, queryByTestId } = await render();

      const { masterClasses, classes, subClasses } = store.getState().class;

      await user.click(getByTestId(`expand-${masterClasses[0].id}`));
      await user.click(getByTestId(`expand-${classes[0].id}`));
      await user.click(getByTestId(`expand-${subClasses[0].id}`));

      expect(getByTestId('class-breadcrumb')).toBeInTheDocument();
      expect(getByTestId('subClass-breadcrumb')).toBeInTheDocument();

      await user.click(getByTestId('masterClass-breadcrumb'));

      expect(queryByTestId('class-breadcrumb')).toBeNull();
      expect(queryByTestId('subClass-breadcrumb')).toBeNull();
    });
  });

  describe('PlanningToolbar', () => {
    it('doesnt render anything yet', async () => {
      const { getByTestId } = await render();

      expect(getByTestId('toolbar')).toBeInTheDocument();
      expect(getByTestId('toolbar-left')).toBeInTheDocument();
      expect(getByTestId('toolbar-right')).toBeInTheDocument();
    });
  });

  describe('PlanningInfoPanel', () => {
    it('shows the view as planning and doesnt render selectedMasterClass name or previous button if no masterClass is expanded', async () => {
      const { getByTestId, queryByTestId, container } = await render();

      // Main container
      expect(container.getElementsByClassName('planning-info-panel')[0]).toBeInTheDocument();
      // Grid containers
      expect(getByTestId('mode-button-container')).toBeInTheDocument();
      expect(getByTestId('selected-class-container')).toBeInTheDocument();
      expect(getByTestId('previous-button-container')).toBeInTheDocument();
      // Mode button
      expect(getByTestId('mode-button')).toHaveTextContent('planning');
      // Selected masterClass text
      expect(queryByTestId('selected-class')).toBeNull();
      expect(queryByTestId('currency-indicator')).toBeNull();
      // Previous button
      expect(queryByTestId('previous-button')).toBeNull();
    });

    it('shows the selectedMasterClass name and the previos-button if a masterClass is expanded', async () => {
      const { getByTestId, user, store } = await render();
      const { id: masterClassId } = store.getState().class.masterClasses[0];

      await user.click(getByTestId(`expand-${masterClassId}`));

      expect(getByTestId('selected-class')).toBeInTheDocument();
      expect(getByTestId('currency-indicator')).toBeInTheDocument();
      expect(getByTestId('previous-button')).toBeInTheDocument();
    });

    it('previous-button navigates back in history when clicked', async () => {
      const { getByTestId, user, store } = await render();

      const { id: masterClassId } = store.getState().class.masterClasses[0];
      const { id: classId } = store.getState().class.classes[0];

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
    it('renders all rows but an empty table with the startYear if a masterClass isnt selected', async () => {
      const { getByTestId, container } = await render();

      const finances = mockClassFinances;
      const { year, budgetOverrunAmount, ...rest } = finances;

      expect(container.getElementsByClassName('planning-summary-table')[0]).toBeInTheDocument();
      expect(getByTestId('planning-summary-head')).toBeInTheDocument();
      expect(getByTestId('planning-summary-head-row')).toBeInTheDocument();

      for (let i = 0; i < 11; i++) {
        const title = getPlanningRowTitle(i);
        const headCell = getByTestId(`head-${year + i}`);
        expect(headCell).toHaveTextContent((year + i).toString());
        expect(headCell).toHaveTextContent(title);
      }

      expect(getByTestId('planning-summary-body')).toBeInTheDocument();
      expect(getByTestId('planning-summary-planned-budget-row')).toBeInTheDocument();
      expect(getByTestId('planning-summary-realized-budget-row')).toBeInTheDocument();

      Object.keys(rest).forEach((k) => {
        expect(getByTestId(`summary-budget-${k}`)).toHaveTextContent('');
        expect(getByTestId(`summary-frame-${k}`)).toHaveTextContent('');
        expect(getByTestId(`summary-budget-${k}`)).toHaveTextContent('');
      });
    });

    it('renders the selectedMasterClasses financial data if a masterClass is expanded', async () => {
      const { getByTestId, user } = await render();

      const finances = mockClassFinances;
      const { year, budgetOverrunAmount, ...rest } = finances;
      const { id: masterClassId } = mockMasterClasses.data[0];

      await user.click(getByTestId(`expand-${masterClassId}`));

      const cells = calculatePlanningCells(finances);

      await waitFor(() => {
        Object.keys(rest).forEach((k, i) => {
          const { plannedBudget, frameBudget, deviation } = cells[i];
          expect(getByTestId(`summary-budget-${k}`)).toHaveTextContent(plannedBudget || '');
          expect(getByTestId(`summary-frame-${k}`)).toHaveTextContent(frameBudget);
          expect(getByTestId(`summary-deviation-${k}`)).toHaveTextContent(deviation?.value || '');
        });
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

      const { masterClasses, classes, subClasses } = store.getState().class;
      const { districts, divisions } = store.getState().location;
      const { groups } = store.getState().group;

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

      const { masterClasses, classes, subClasses } = store.getState().class;
      const { districts, divisions } = store.getState().location;
      const { groups } = store.getState().group;

      const projects = mockPlanningViewProjects.data.results;

      const expectRowProperties = (finances: IClassFinances, id: string) => {
        const { availableFrameBudget, costEstimateBudget, deviation } =
          calculatePlanningRowSums(finances);

        expect(getByTestId(`row-${id}`)).toBeInTheDocument();
        expect(getByTestId(`available-frame-budget-${id}`)).toHaveTextContent(availableFrameBudget);
        expect(getByTestId(`cost-estimate-budget-${id}`)).toHaveTextContent(costEstimateBudget);
        expect(getByTestId(`deviation-${id}`)).toHaveTextContent(deviation.value);
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
          expect(getByTestId(`row-${p.id}`)).toBeInTheDocument(),
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
          expectRowProperties(finances, id);
          expect(getByTestId(`row-${id}`).classList.contains('group')).toBeTruthy();
        });
      });

      // Check that projects that belong directly to the selected subClass are visible
      const projectsForSubClassWithoutGroup = projects.filter(
        (p) => p.projectClass === classId && !p.projectLocation && !p.projectGroup,
      );

      await waitFor(() => {
        projectsForSubClassWithoutGroup.forEach(({ id }) =>
          expect(getByTestId(`row-${id}`)).toBeInTheDocument(),
        );
      });

      const districtsForSubClass = districts.filter((c) => c.parentClass === subClassId);

      // // Check that all district-rows are visible and they have the 'district-preview' class
      districtsForSubClass.forEach(({ id }) => {
        expect(getByTestId(`row-${id}`)).toBeInTheDocument();
        expect(getByTestId(`row-${id}`).classList.contains('district-preview')).toBeTruthy();
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
              getByTestId(`row-${districtId}`).classList.contains('district-preview'),
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
        groupsForDistrict.forEach(({ id, finances }) => {
          expectRowProperties(finances, id);
          expect(getByTestId(`row-${id}`).classList.contains('group')).toBeTruthy();
        });
      });

      //Check that projects that belong directly to the selected district are visible
      const projectsForDistrictWithoutGroup = projects.filter(
        (p) => p.projectLocation === districtId && !p.projectGroup,
      );

      await waitFor(() => {
        projectsForDistrictWithoutGroup.forEach(({ id }) =>
          expect(getByTestId(`row-${id}`)).toBeInTheDocument(),
        );
      });

      // Divisions should be expanded by default and render all their children
      const divisionsForDistrict = divisions.filter((d) => d.parent === districtId);

      await waitFor(() => {
        divisionsForDistrict.forEach(({ id }) => {
          expect(getByTestId(`row-${id}`)).toBeInTheDocument();
          expect(getByTestId(`row-${id}`).classList.contains('division')).toBeTruthy();

          //Check that projects that belong directly to each division are visible
          const projectsForDivision = projects.filter(
            (p) => p.projectLocation === id && !p.projectGroup,
          );

          projectsForDivision.forEach(({ id }) =>
            expect(getByTestId(`row-${id}`)).toBeInTheDocument(),
          );
        });
      });

      // Check that groups that belong directly to the selected district are visible
      const groupsForDivision = groups.filter((g) => g.locationRelation === divisions[0].id);

      await waitFor(() => {
        groupsForDivision.forEach(({ id, finances }) => {
          expectRowProperties(finances, id);
          expect(getByTestId(`row-${id}`).classList.contains('group')).toBeTruthy();
        });
      });

      // Click the first group row
      const { id: groupId } = groupsForDivision[0];
      await user.click(getByTestId(`expand-${groupId}`));

      // Check that projects that belong directly to opened group are visible
      const projectsForGroup = projects.filter((p) => p.projectGroup === groupId);

      await waitFor(() => {
        projectsForGroup.forEach(({ id }) => expect(getByTestId(`row-${id}`)).toBeInTheDocument());
      });
    });

    it('can click expand button to show and hide children and does not bring back all parent rows when re-clicked', async () => {
      const { store, getByTestId, queryByTestId, user } = await render();

      const { masterClasses, classes } = store.getState().class;

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
    it('renders head and cells', async () => {
      const { store, getByTestId } = await render();

      const { id } = store.getState().class.masterClasses[0];

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
      const { masterClasses, classes } = store.getState().class;

      const { id: masterClassId } = masterClasses[0];
      const { id: classId } = classes[0];

      await user.click(getByTestId(`expand-${masterClassId}`));

      expect(getByTestId('masterClass-breadcrumb')).toBeInTheDocument();
      expect(getByTestId(`row-${classId}`)).toBeInTheDocument();

      await user.click(getByTestId(`title-${masterClassId}`));

      expect(getByTestId('masterClass-breadcrumb')).toBeInTheDocument();
      expect(queryByTestId(`row-${classId}`)).toBeNull();
    });

    describe('PlanningHeader', () => {
      it('renders all elements', async () => {
        const { store, getByTestId } = await render();

        const { id } = store.getState().class.masterClasses[0];

        // Expand button
        expect(getByTestId(`expand-${id}`)).toBeInTheDocument();
        // Show more button
        expect(getByTestId(`show-more-${id}`)).toBeInTheDocument();
        // Title
        expect(getByTestId(`title-${id}`)).toBeInTheDocument();
      });
    });

    describe('PlanningCell', () => {
      it('renders budget, overrun and deviation only for the current year and formats the numbers', async () => {
        const { store, getByTestId } = await render();

        const { id, finances } = store.getState().class.masterClasses[0];

        const firstCell = getByTestId(`row-${id}`).children[1];
        const year = new Date().getFullYear();

        const cells = calculatePlanningCells(finances);

        const { plannedBudget, frameBudget, deviation } = cells[0];

        expect(firstCell.children[0].children.length).toBe(3);

        expect(getByTestId(`planned-budget-${id}-${year}`)).toHaveTextContent(plannedBudget || '0');
        expect(getByTestId(`frame-budget-${id}-${year}`)).toHaveTextContent(frameBudget);
        expect(getByTestId(`deviation-${id}-${year}`)).toHaveTextContent(deviation?.value || '0');
      });

      it('renders frame budget for future years', async () => {
        const { store, getByTestId } = await render();

        const { id, finances } = store.getState().class.masterClasses[0];
        const secondCell = getByTestId(`row-${id}`).children[2];
        const year = new Date().getFullYear() + 1;

        expect(secondCell.children[0].children.length).toBe(1);

        for (let i = 0; i < 10; i++) {
          expect(getByTestId(`frame-budget-${id}-${year + i}`)).toHaveTextContent(
            formatNumber(
              (finances[`year${i + 1}` as keyof IClassFinances] as IClassBudgets).frameBudget,
            ),
          );
        }
      });
    });

    describe('NameTooltip', () => {
      it('FIXME is hidden by default and displays the current rows title on hover', async () => {
        const { store, getByTestId, user } = await render();

        const { name, id } = store.getState().class.masterClasses[0];
        const rowTitle = getByTestId(`title-${id}`);
        const hoverTooltip = getByTestId(`hover-tooltip-${id}`);

        // FIXME: its always visible in the test for some reason expect(hoverTooltip).not.toBeVisible();

        await user.hover(rowTitle);

        expect(hoverTooltip).toBeVisible();
        expect(hoverTooltip).toHaveTextContent(name);

        await user.unhover(rowTitle);

        // FIXME: its always visible in the test for some reason expect(hoverTooltip).not.toBeVisible();
      });
    });

    describe('Project Row', () => {
      it('renders all the elements and the row budgets and no financial data to cells if there is no planning or construction', async () => {
        const renderResult = await render();

        const { getByTestId } = renderResult;
        const project = mockPlanningViewProjects.data.results[0];
        const { id, category, name, finances } = project;

        await waitFor(() => navigateToProjectRows(renderResult));

        await waitFor(() => {
          expect(getByTestId(`row-${id}`)).toBeInTheDocument();
          expect(getByTestId(`head-${id}`)).toBeInTheDocument();
          expect(getByTestId(`edit-phase-${id}`)).toBeInTheDocument();
          expect(getByTestId(`navigate-${id}`)).toHaveTextContent(name);
          expect(getByTestId(`category-${id}`)).toHaveTextContent((category as IListItem).value);

          const { availableFrameBudget, costEstimateBudget } = calculateProjectRowSums(project);

          expect(getByTestId(`cost-estimate-budget-${id}`)).toHaveTextContent(costEstimateBudget);
          expect(getByTestId(`available-frame-budget-${id}`)).toHaveTextContent(
            availableFrameBudget,
          );

          for (let i = 0; i < 10; i++) {
            const year = finances.year + i;
            expect(getByTestId(`project-cell-${year}-${id}`)).toBeInTheDocument();
            expect(getByTestId(`cell-input-${year}-${id}`)).toBeDisabled();
          }
        });
      });

      it('doesnt render the project category if there is no category', async () => {
        const renderResult = await render();
        const { queryByTestId } = renderResult;

        const { id } = mockPlanningViewProjects.data.results[1];

        await waitFor(() => navigateToProjectRows(renderResult));

        await waitFor(() => {
          expect(queryByTestId(`category-${id}`)).toBeNull();
        });
      });

      it('can patch the project phase with the custom context menu', async () => {
        const project = mockPlanningViewProjects.data.results[0];

        const mockPatchPhaseResponse = {
          data: {
            ...project,
            phase: mockProjectPhases.data[0],
          },
        };

        mockedAxios.patch.mockResolvedValueOnce(mockPatchPhaseResponse);

        const renderResult = await render();

        const { user, getByTestId, getByText, queryByTestId } = renderResult;

        const { id } = project;
        const phasesAsOptions = mockProjectPhases.data.map((p) => listItemToOption(p));
        const firstOptionValue = phasesAsOptions[0].value;

        await waitFor(() => navigateToProjectRows(renderResult));

        // Open context menu for phase
        await waitFor(async () => await user.click(getByTestId(`edit-phase-${id}`)));

        // Context menu is visible
        await waitFor(() => expect(getByTestId('project-phase-menu')).toBeInTheDocument());

        // All options are visible
        phasesAsOptions.forEach((p) => expect(getByText(`enums.${p.label}`)).toBeInTheDocument());

        // Click first option
        await user.click(getByTestId(`select-${firstOptionValue}`));

        // First option is selected
        expect(
          getByTestId(`project-phase-menu-option-${firstOptionValue}`).classList.contains(
            'selected',
          ),
        ).toBeTruthy();

        // Save the option
        await user.click(getByTestId('patch-project-phase'));

        await waitFor(() => {
          const patchMock = mockedAxios.patch.mock.lastCall;
          expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-1/');
        });

        // Context menu is hidden after patch
        await waitFor(() => expect(queryByTestId('project-phase-menu')).toBeNull());

        // Open context menu for phase
        await waitFor(async () => await user.click(getByTestId(`edit-phase-${id}`)));

        // Patched option is the selected option

        await waitFor(() => {
          expect(
            getByTestId(`project-phase-menu-option-${firstOptionValue}`).classList.contains(
              'selected',
            ),
          ).toBeTruthy();
        });
      });

      it('creates cells for planning, construction and overlap when the project has planning', async () => {
        const renderResult = await render();

        const { getByTestId } = renderResult;
        const { id, finances } = mockPlanningViewProjects.data.results[1];

        await waitFor(() => navigateToProjectRows(renderResult));

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
              expect(cell.classList.contains('plan')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.budgetProposalCurrentYearPlus1));
            }
            // Planning
            if (i === 2) {
              expect(cell.classList.contains('plan')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.budgetProposalCurrentYearPlus2));
            }
            // Overlap
            if (i === 3) {
              expect(cell.classList.contains('overlap')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.preliminaryCurrentYearPlus3));
            }
            // Construction
            if (i === 4) {
              expect(cell.classList.contains('con')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.preliminaryCurrentYearPlus4));
            }
            // Construction
            if (i === 5) {
              expect(cell.classList.contains('con')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.preliminaryCurrentYearPlus5));
            }
            // Construction
            if (i === 6) {
              expect(cell.classList.contains('con')).toBeTruthy();
              expect(input).toHaveValue(asNumber(finances.preliminaryCurrentYearPlus6));
            }
          }
        });
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

          await waitFor(() => navigateToProjectRows(renderResult));

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

          const { user, getByTestId } = renderResult;
          const { id, name } = project;
          const yearToHide = year + 4;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(yearToHide, id, renderResult));

          expect(getByTestId('project-cell-menu')).toBeInTheDocument();
          expect(getByTestId('close-project-cell-menu')).toBeInTheDocument();
          expect(getByTestId('cell-year')).toHaveTextContent(yearToHide.toString());
          expect(getByTestId('cell-title')).toHaveTextContent(name);
          expect(getByTestId('cell-type-con').classList.contains('selected')).toBeTruthy();
          expect(getByTestId('cell-type-plan')).toBeInTheDocument();

          // Delete cell
          await user.click(getByTestId('remove-year-button'));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchRequest);
            // Cell is hidden
            expect(getByTestId(`cell-input-${yearToHide}-${id}`)).toBeDisabled();
            expect(getByTestId(`cell-input-${yearToHide}-${id}`)).toHaveValue(null);
            expect(
              getByTestId(`project-cell-${yearToHide}-${id}`).classList.contains('none'),
            ).toBeTruthy();
            // Next cell is still construction in the document
            expect(
              getByTestId(`project-cell-${yearToHide + 1}-${id}`).classList.contains('con'),
            ).toBeTruthy();
          });
        });

        it('can delete the start and end of the timeline to decrease the planning or construction dates', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();

          const patchConEndRequest = {
            finances: {
              year: year,
              preliminaryCurrentYearPlus5: '130',
              preliminaryCurrentYearPlus6: '0',
            },
            // FIXME: the updateYear() function in dates.ts generates a date that is 5 days in the past,
            // we should actually expect 12.02.2028
            estConstructionEnd: `07.02.${year + 5}`,
          };

          const mockRemoveConEndPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchConEndRequest.finances,
              },
              estConstructionEnd: patchConEndRequest.estConstructionEnd,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockRemoveConEndPatchResponse);

          const renderResult = await render();

          const { user, getByTestId } = renderResult;
          const { id } = project;
          const endOfTimeline = year + 6;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(endOfTimeline, id, renderResult));
          await user.click(getByTestId('remove-year-button'));

          // Check that correct data was patched and construction end date has moved
          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchConEndRequest);
            // Cell is hidden
            expect(getByTestId(`cell-input-${endOfTimeline}-${id}`)).toBeDisabled();
            expect(getByTestId(`cell-input-${endOfTimeline}-${id}`)).toHaveValue(null);
            expect(
              getByTestId(`project-cell-${endOfTimeline}-${id}`).classList.contains('none'),
            ).toBeTruthy();
          });

          const startOfTimeline = year + 1;

          const patchPlanStartRequest = {
            finances: {
              year: year,
              budgetProposalCurrentYearPlus1: '0',
              budgetProposalCurrentYearPlus2: '30',
            },
            // FIXME: the updateYear() function in dates.ts generates a date that is 5 days in the past,
            // we should actually expect 12.02.2025
            estPlanningStart: `10.02.${year + 2}`,
          };

          const mockRemovePlanStartPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchPlanStartRequest.finances,
              },
              estPlanningStart: `12.02.${year + 2}`,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockRemovePlanStartPatchResponse);

          await waitFor(() => openContextMenuForCell(startOfTimeline, id, renderResult));
          await user.click(getByTestId('remove-year-button'));

          // Check that correct data was patched and planning start has moved
          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchPlanStartRequest);
            expect(getByTestId(`cell-input-${startOfTimeline}-${id}`)).toBeDisabled();
            expect(getByTestId(`cell-input-${startOfTimeline}-${id}`)).toHaveValue(null);
            expect(
              getByTestId(`project-cell-${startOfTimeline}-${id}`).classList.contains('none'),
            ).toBeTruthy();
          });
        });

        it('it removes construction end and start dates if last construction cell is removed', async () => {
          const project = mockPlanningViewProjects.data.results[8];
          const year = new Date().getFullYear();

          const patchLastConRequest = {
            finances: {
              year: year,
              preliminaryCurrentYearPlus3: '0',
            },
            estConstructionEnd: null,
            estConstructionStart: null,
          };

          const mockRemoveLastConPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchLastConRequest.finances,
              },
              estConstructionEnd: null,
              estConstructionStart: null,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockRemoveLastConPatchResponse);

          const renderResult = await render();

          const { user, getByTestId } = renderResult;
          const { id } = project;
          const lastConYear = year + 3;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(lastConYear, id, renderResult));
          await user.click(getByTestId('remove-year-button'));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-9/');
            expect(patchMock[1]).toStrictEqual(patchLastConRequest);
          });
        });

        it('it removes planning end and start dates if last planning cell is removed', async () => {
          const project = mockPlanningViewProjects.data.results[9];
          const year = new Date().getFullYear();

          const patchLastPlanRequest = {
            finances: {
              year: year,
              preliminaryCurrentYearPlus3: '0',
            },
            estPlanningStart: null,
            estPlanningEnd: null,
          };

          const mockRemoveLastPlanPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchLastPlanRequest.finances,
              },
              estPlanningStart: null,
              estPlanningEnd: null,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockRemoveLastPlanPatchResponse);

          const renderResult = await render();

          const { user, getByTestId } = renderResult;
          const { id } = project;
          const lastPlanYear = year + 3;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(lastPlanYear, id, renderResult));
          await user.click(getByTestId('remove-year-button'));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-10/');
            expect(patchMock[1]).toStrictEqual(patchLastPlanRequest);
          });
        });

        it('it removes planning and construction end and start dates if last overlap cell is removed', async () => {
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
          };

          const mockRemoveLastOverlapPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchLastOverlapRequest.finances,
              },
              estConstructionStart: null,
              estConstructionEnd: null,
              estPlanningStart: null,
              estPlanningEnd: null,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockRemoveLastOverlapPatchResponse);

          const renderResult = await render();

          const { user, getByTestId } = renderResult;
          const { id } = project;
          const lastOverlapYear = year + 3;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(lastOverlapYear, id, renderResult));
          await user.click(getByTestId('remove-year-button'));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-11/');
            expect(patchMock[1]).toStrictEqual(patchLastOverlapRequest);
          });
        });

        it('can add a year to construction and replaces the budgets null value with 0', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();

          const patchAddConYearRequest = {
            finances: { year: year, preliminaryCurrentYearPlus7: '0' },
            estConstructionEnd: `12.02.${year + 7}`,
          };

          const mockAddConYearPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchAddConYearRequest.finances,
              },
              estConstructionEnd: patchAddConYearRequest.estConstructionEnd,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockAddConYearPatchResponse);

          const renderResult = await render();

          const { user, getByTestId } = renderResult;
          const { id } = project;
          const conEndYear = year + 6;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(conEndYear, id, renderResult));
          await user.click(getByTestId('edit-year-button'));

          const addYearButton = getByTestId(`add-cell-${conEndYear}-${id}-right`);
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

          const patchAddPlanYearRequest = {
            finances: { year: year },
            estPlanningStart: `12.02.${year}`,
          };

          const mockAddConYearPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchAddPlanYearRequest.finances,
              },
              estPlanningStart: patchAddPlanYearRequest.estPlanningStart,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockAddConYearPatchResponse);

          const renderResult = await render();

          const { user, getByTestId } = renderResult;
          const { id } = project;
          const planStartYear = year + 1;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(planStartYear, id, renderResult));
          await user.click(getByTestId('edit-year-button'));

          const addYearButton = getByTestId(`add-cell-${planStartYear}-${id}-left`);

          await user.click(addYearButton);

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchAddPlanYearRequest);
          });
        });

        it('can add a year to planning and construction if an overlap cell is selected', async () => {
          const project = mockPlanningViewProjects.data.results[10];
          const year = new Date().getFullYear();

          const patchAddOverlapPlanRequest = {
            finances: { year: year },
            estPlanningStart: `12.02.${year + 2}`,
          };

          const mockAddOverlapPlanPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchAddOverlapPlanRequest.finances,
              },
              estPlanningStart: patchAddOverlapPlanRequest.estPlanningStart,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockAddOverlapPlanPatchResponse);

          const renderResult = await render();

          const { user, getByTestId } = renderResult;
          const { id } = project;
          const overlapYear = year + 3;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(overlapYear, id, renderResult));
          await user.click(getByTestId('edit-year-button'));

          const addYearButton = getByTestId(`add-cell-${overlapYear}-${id}-left`);

          await user.click(addYearButton);

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-11/');
            expect(patchMock[1]).toStrictEqual(patchAddOverlapPlanRequest);
          });

          const patchAddOverlapConRequest = {
            finances: { year: year },
            estPlanningStart: `12.02.${year + 2}`,
          };

          const mockAddOverlapConPatchResponse = {
            data: {
              ...project,
              finances: {
                ...project.finances,
                ...patchAddOverlapConRequest.finances,
              },
              estPlanningStart: patchAddOverlapConRequest.estPlanningStart,
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockAddOverlapConPatchResponse);

          await waitFor(() => openContextMenuForCell(overlapYear, id, renderResult));
          await user.click(getByTestId('edit-year-button'));

          await user.click(addYearButton);

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-11/');
            expect(patchMock[1]).toStrictEqual(patchAddOverlapConRequest);
          });
        });

        it('can increase the whole timeline by one year with double clicking ', async () => {
          const project = mockPlanningViewProjects.data.results[1];
          const year = new Date().getFullYear();

          const patchMoveYearRequest = {
            finances: {
              year: year,
              budgetProposalCurrentYearPlus0: '0.00',
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
            estPlanningStart: `12.02.${year + 2}`,
            estPlanningEnd: `12.02.${year + 4}`,
            estConstructionStart: `12.02.${year + 4}`,
            estConstructionEnd: `12.02.${year + 7}`,
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

          const { user, getByTestId } = renderResult;
          const { id } = project;
          const conEndYear = year + 6;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(conEndYear, id, renderResult));
          await user.click(getByTestId('edit-year-button'));

          const addYearButton = getByTestId(`add-cell-${conEndYear}-${id}-right`);
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
              preliminaryCurrentYearPlus10: '0.00',
            },
            estPlanningStart: `12.02.${year}`,
            estPlanningEnd: `12.02.${year + 2}`,
            estConstructionStart: `12.02.${year + 2}`,
            estConstructionEnd: `12.02.${year + 5}`,
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

          const { user, getByTestId } = renderResult;
          const { id } = project;
          const planStartYear = year + 1;

          await waitFor(() => navigateToProjectRows(renderResult));
          await waitFor(() => openContextMenuForCell(planStartYear, id, renderResult));
          await user.click(getByTestId('edit-year-button'));

          const addYearButton = getByTestId(`add-cell-${planStartYear}-${id}-left`);
          expect(addYearButton).toBeVisible();

          await user.dblClick(addYearButton);

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock.lastCall;
            expect(patchMock[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(patchMock[1]).toStrictEqual(patchMoveYearRequest);
          });
        });
      });
    });
  });
});
