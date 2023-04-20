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
import { act } from 'react-dom/test-utils';
import PlanningView from './PlanningView';
import { mockDistricts, mockDivisions, mockLocations } from '@/mocks/mockLocations';
import { mockProjectPhases } from '@/mocks/mockLists';
import { mockGroups } from '@/mocks/mockGroups';
import { Route } from 'react-router';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { waitFor } from '@testing-library/react';
import mockPlanningViewProjects from '@/mocks/mockPlanningViewProjects';
import { IListItem } from '@/interfaces/common';
import { CustomContextMenu } from '@/components/CustomContextMenu';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;
const store = setupStore();

describe('PlanningView', () => {
  let renderResult: CustomRenderResult;

  const getClass = (name: string) => {
    const { container } = renderResult;
    return container.getElementsByClassName(name)[0];
  };

  const asNumber = (value: string | null) => parseInt(value || '');

  beforeEach(async () => {
    // Mock custom event
    mockGetResponseProvider();

    await act(
      async () =>
        (renderResult = renderWithProviders(
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
        )),
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the container', async () => {
    expect(getClass('planning-view-container')).toBeInTheDocument();
  });

  describe('PlanningBreadCrumbs', () => {
    it('renders only first breadcrumb if no table row is expanded', async () => {
      const { getByTestId, queryByTestId } = renderResult;
      expect(getClass('breadcrumbs-list')).toBeInTheDocument();
      expect(getByTestId('programming-breadcrumb')).toBeInTheDocument();
      expect(queryByTestId('masterClass-breadcrumb')).toBeNull();
      expect(queryByTestId('class-breadcrumb')).toBeNull();
      expect(queryByTestId('subClass-breadcrumb')).toBeNull();
      expect(queryByTestId('district-breadcrumb')).toBeNull();
    });

    it('renders breadcrumbs when table rows are expanded all the way to the selected district and navigates to planning frontpage from first breadcrumb', async () => {
      const { getByTestId, user, store, getAllByTestId, queryByTestId } = renderResult;

      const firstMasterClass = store.getState().class.masterClasses[0];
      const firstClass = store.getState().class.classes[0];
      const firstSubClass = store.getState().class.subClasses[0];
      const firstDistrict = store.getState().location.districts[0];

      await user.click(getByTestId(`expand-${firstMasterClass.id}`));
      expect(getByTestId('masterClass-breadcrumb')).toHaveAttribute(
        'href',
        `/${firstMasterClass.id}`,
      );

      await user.click(getByTestId(`expand-${firstClass.id}`));
      expect(getByTestId('class-breadcrumb')).toHaveAttribute(
        'href',
        `/${firstMasterClass.id}/${firstClass.id}`,
      );

      await user.click(getByTestId(`expand-${firstSubClass.id}`));
      expect(getByTestId('subClass-breadcrumb')).toHaveAttribute(
        'href',
        `/${firstMasterClass.id}/${firstClass.id}/${firstSubClass.id}`,
      );

      await user.click(getByTestId(`expand-${firstDistrict.id}`));
      expect(getByTestId('district-breadcrumb')).toHaveAttribute(
        'href',
        `/${firstMasterClass.id}/${firstClass.id}/${firstSubClass.id}/${firstDistrict.id}`,
      );

      expect(getAllByTestId('breadcrumb-arrow').length).toBe(4);

      await user.click(getByTestId('programming-breadcrumb'));

      expect(queryByTestId('masterClass-breadcrumb')).toBeNull();
      expect(queryByTestId('class-breadcrumb')).toBeNull();
      expect(queryByTestId('subClass-breadcrumb')).toBeNull();
      expect(queryByTestId('district-breadcrumb')).toBeNull();
    });

    it('navigates to the clicked class', async () => {
      const { getByTestId, store, user, queryByTestId } = renderResult;

      const firstMasterClass = store.getState().class.masterClasses[0];
      const firstClass = store.getState().class.classes[0];
      const firstSubClass = store.getState().class.subClasses[0];

      await user.click(getByTestId(`expand-${firstMasterClass.id}`));
      await user.click(getByTestId(`expand-${firstClass.id}`));
      await user.click(getByTestId(`expand-${firstSubClass.id}`));

      expect(getByTestId('class-breadcrumb')).toBeInTheDocument();
      expect(getByTestId('subClass-breadcrumb')).toBeInTheDocument();

      await user.click(getByTestId('masterClass-breadcrumb'));

      expect(queryByTestId('class-breadcrumb')).toBeNull();
      expect(queryByTestId('subClass-breadcrumb')).toBeNull();
    });
  });

  describe('PlanningToolbar', () => {
    it('doesnt render anything yet', () => {
      const { getByTestId } = renderResult;
      expect(getByTestId('toolbar')).toBeInTheDocument();
      expect(getByTestId('toolbar-left')).toBeInTheDocument();
      expect(getByTestId('toolbar-right')).toBeInTheDocument();
    });
  });

  describe('PlanningInfoPanel', () => {
    it('shows the view as planning and doesnt render selectedMasterClass name or previous button if no masterClass is expanded', async () => {
      const { getByTestId, queryByTestId } = renderResult;

      // Main container
      expect(getClass('planning-info-panel')).toBeInTheDocument();
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
      const { getByTestId, user, store } = renderResult;
      const firstMasterClass = store.getState().class.masterClasses[0];

      await user.click(getByTestId(`expand-${firstMasterClass.id}`));

      expect(getByTestId('selected-class')).toBeInTheDocument();
      expect(getByTestId('currency-indicator')).toBeInTheDocument();
      expect(getByTestId('previous-button')).toBeInTheDocument();
    });

    it('previous-button navigates back in history when clicked', async () => {
      const { getByTestId, user, store } = renderResult;
      const firstMasterClass = store.getState().class.masterClasses[0];
      const firstClass = store.getState().class.classes[0];

      await user.click(getByTestId(`expand-${firstMasterClass.id}`));
      await user.click(getByTestId(`expand-${firstClass.id}`));

      expect(getByTestId('masterClass-breadcrumb')).toBeInTheDocument();
      expect(getByTestId('class-breadcrumb')).toBeInTheDocument();

      await user.click(getByTestId('previous-button'));

      //FIXME: navigate(-1) doesnt seem to work...
      // expect(queryByTestId('class-breadcrumb')).toBeNull();

      // await user.click(getByTestId('previous-button'));

      // expect(queryByTestId('masterClass-breadcrumb')).toBeNull();
    });
  });

  describe('PlanningYearsTable', () => {
    it('renders the current year + 10 years and mock data for now', async () => {
      const { getByTestId, getAllByText } = renderResult;
      expect(getClass('planning-years-table')).toBeInTheDocument();
      expect(getByTestId('planning-years-head')).toBeInTheDocument();
      expect(getByTestId('planning-years-head-row')).toBeInTheDocument();
      expect(getByTestId('planning-years-body')).toBeInTheDocument();
      expect(getByTestId('planning-years-total-budget-row')).toBeInTheDocument();
      expect(getByTestId('planning-years-realized-budget-row')).toBeInTheDocument();
      expect(getByTestId('planning-years-overrun-row')).toBeInTheDocument();
      expect(getByTestId('planning-years-deviation-row')).toBeInTheDocument();
      expect(getAllByText('alustava').length).toBe(6);

      for (let i = 0; i < 10; i++) {
        const year = new Date().getFullYear() + i;
        const currentHeaderCell = getByTestId(`head-${year}`);
        const currentTotalBudgetCell = getByTestId(`budget-${year}`);
        const currentRealizedBudgetCell = getByTestId(`realized-${year}`);
        const currentOverrunCell = getByTestId(`overrun-${year}`);
        const currentDeviationCell = getByTestId(`deviation-${year}`);

        expect(currentHeaderCell).toHaveTextContent(`<> ${year}`);
        expect(currentTotalBudgetCell).toHaveTextContent('341 400');
        expect(currentRealizedBudgetCell).toBeInTheDocument();
        expect(currentOverrunCell).toHaveTextContent('400');
        expect(currentDeviationCell).toHaveTextContent('1400');

        // First col
        if (i === 0) {
          expect(currentHeaderCell).toHaveTextContent('kuluva TA');
          expect(currentRealizedBudgetCell).toHaveTextContent('340 200');
          expect(currentOverrunCell.children[0].classList.contains('overrun-icon')).toBeTruthy();
          expect(currentOverrunCell).toHaveTextContent('+400');
        }
        // Second col
        if (i === 1) {
          expect(currentHeaderCell).toHaveTextContent('TAE');
        }
        // Third and fourth col
        if (i === 2 || i === 3) {
          expect(currentHeaderCell).toHaveTextContent('TSE');
          expect(currentHeaderCell).toHaveTextContent('TSE');
        }
        // Fifth col
        if (i === 4) {
          expect(currentHeaderCell).toHaveTextContent('kuluva TA');
        }
      }
    });
  });

  describe('PlanningTable', () => {
    it('renders the table', async () => {
      expect(getClass('planning-table')).toBeInTheDocument();
    });

    it('renders only masterClass rows, heads and cells if no masterClass is expanded', () => {
      const { store, getByTestId, queryByTestId } = renderResult;

      const { masterClasses, classes, subClasses } = store.getState().class;
      const { districts, divisions } = store.getState().location;
      const { groups } = store.getState().group;

      classes.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      subClasses.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      districts.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      divisions.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      groups.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      // There are as many rows as masterClasses
      expect(getClass('planning-table').children[0].children.length).toBe(masterClasses.length);
      // Check that each masterClass has all the row properties
      masterClasses.forEach(({ id }) => expect(getByTestId(`row-${id}`)).toBeInTheDocument());
    });

    it('renders all children rows and only one parent when parent is expanded', async () => {
      const { store, getByTestId, queryByTestId, user } = renderResult;

      const { masterClasses, classes, subClasses } = store.getState().class;
      const { districts, divisions } = store.getState().location;
      const { groups } = store.getState().group;

      const projects = mockPlanningViewProjects.data.results;

      // Check that all masterClass-rows is visible
      masterClasses.forEach(({ id }) => expect(getByTestId(`row-${id}`)).toBeInTheDocument());

      // Click the first masterclass row
      const firstMasterClassId = masterClasses[0].id;
      await user.click(getByTestId(`expand-${firstMasterClassId}`));

      // Check that only first masterClass-row are visible
      await waitFor(() => {
        masterClasses.forEach(({ id }, i) => {
          if (i === 0) {
            expect(getByTestId(`row-${id}`)).toBeInTheDocument();
            expect(getByTestId(`row-${id}`).classList.contains('masterClass')).toBeTruthy();
          }
          if (i !== 0) {
            expect(queryByTestId(`row-${id}`)).toBeNull();
          }
        });
      });

      const classesForMasterClass = classes.filter((c) => c.parent === firstMasterClassId);

      // Check that all class-rows are visible
      classesForMasterClass.forEach(({ id }) =>
        expect(getByTestId(`row-${id}`)).toBeInTheDocument(),
      );

      // Click the first class row
      const firstClassId = classesForMasterClass[0].id;
      await user.click(getByTestId(`expand-${firstClassId}`));

      // Check that only first class-row is visible
      await waitFor(() => {
        classes.forEach(({ id }, i) => {
          if (i === 0) {
            expect(getByTestId(`row-${id}`)).toBeInTheDocument();
            expect(getByTestId(`row-${id}`).classList.contains('class')).toBeTruthy();
          }
          if (i !== 0) {
            expect(queryByTestId(`row-${id}`)).toBeNull();
          }
        });
      });

      // Check that projects that belong directly to the selected class are visible
      const projectsForClassWithoutGroup = projects.filter(
        (p) => p.projectClass === firstClassId && !p.projectLocation && !p.projectGroup,
      );

      await waitFor(() => {
        projectsForClassWithoutGroup.forEach((p) =>
          expect(getByTestId(`row-${p.id}`)).toBeInTheDocument(),
        );
      });

      const subClassesForClass = subClasses.filter((c) => c.parent === firstClassId);

      // Check that all subClass-rows are visible
      subClassesForClass.forEach(({ id }) => expect(getByTestId(`row-${id}`)).toBeInTheDocument());

      // Click the first subClass row
      const firstSubClassId = subClassesForClass[0].id;
      await user.click(getByTestId(`expand-${firstSubClassId}`));

      // Check that only first subClass-row is visible
      await waitFor(() => {
        subClasses.forEach(({ id }, i) => {
          if (i === 0) {
            expect(getByTestId(`row-${id}`)).toBeInTheDocument();
            expect(getByTestId(`row-${id}`).classList.contains('subClass')).toBeTruthy();
          }
          if (i !== 0) {
            expect(queryByTestId(`row-${id}`)).toBeNull();
          }
        });
      });

      // Check that groups that belong directly to the selected subClass are visible
      const groupsForSubClass = mockGroups.data.filter(
        (g) => g.classRelation === firstSubClassId && !g.locationRelation,
      );

      await waitFor(() => {
        groupsForSubClass.forEach(({ id }) => {
          expect(getByTestId(`row-${id}`)).toBeInTheDocument();
          expect(getByTestId(`row-${id}`).classList.contains('group')).toBeTruthy();
        });
      });

      // Check that projects that belong directly to the selected subClass are visible
      const projectsForSubClassWithoutGroup = projects.filter(
        (p) => p.projectClass === firstClassId && !p.projectLocation && !p.projectGroup,
      );

      await waitFor(() => {
        projectsForSubClassWithoutGroup.forEach(({ id }) =>
          expect(getByTestId(`row-${id}`)).toBeInTheDocument(),
        );
      });

      const districtsForSubClass = districts.filter((c) => c.parentClass === firstSubClassId);

      // // Check that all district-rows are visible and they have the 'district-preview' class
      districtsForSubClass.forEach(({ id }) => {
        expect(getByTestId(`row-${id}`)).toBeInTheDocument();
        expect(getByTestId(`row-${id}`).classList.contains('district-preview')).toBeTruthy();
      });

      // Click the first district row
      const firstDistrictId = districtsForSubClass[0].id;
      await user.click(getByTestId(`expand-${firstDistrictId}`));

      // Check that only first district-row is visible
      await waitFor(() => {
        districts.forEach(({ id }, i) => {
          if (i === 0) {
            expect(getByTestId(`row-${id}`)).toBeInTheDocument();
            expect(getByTestId(`row-${id}`).classList.contains('district')).toBeTruthy();
            expect(
              getByTestId(`row-${firstDistrictId}`).classList.contains('district-preview'),
            ).toBeFalsy();
          }
          if (i !== 0) {
            expect(queryByTestId(`row-${id}`)).toBeNull();
          }
        });
      });

      // Check that groups that belong directly to the selected district are visible
      const groupsForDistrict = mockGroups.data.filter(
        (g) => g.locationRelation === firstDistrictId,
      );

      await waitFor(() => {
        groupsForDistrict.forEach(({ id }) => {
          expect(getByTestId(`row-${id}`)).toBeInTheDocument();
          expect(getByTestId(`row-${id}`).classList.contains('group')).toBeTruthy();
        });
      });

      //Check that projects that belong directly to the selected district are visible
      const projectsForDistrictWithoutGroup = projects.filter(
        (p) => p.projectLocation === firstDistrictId && !p.projectGroup,
      );

      await waitFor(() => {
        projectsForDistrictWithoutGroup.forEach(({ id }) =>
          expect(getByTestId(`row-${id}`)).toBeInTheDocument(),
        );
      });

      // Divisions should be expanded by default and render all their children
      const divisionsForDistrict = divisions.filter((d) => d.parent === firstDistrictId);

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
        groupsForDivision.forEach(({ id }) => {
          expect(getByTestId(`row-${id}`)).toBeInTheDocument();
          expect(getByTestId(`row-${id}`).classList.contains('group')).toBeTruthy();
        });
      });

      // Click the first group row
      const firstGroupId = groupsForDivision[0].id;
      await user.click(getByTestId(`expand-${firstGroupId}`));

      // Check that projects that belong directly to opened group are visible
      const projectsForGroup = projects.filter((p) => p.projectGroup === firstGroupId);

      await waitFor(() => {
        projectsForGroup.forEach(({ id }) => expect(getByTestId(`row-${id}`)).toBeInTheDocument());
      });
    });

    it('can click expand button to show and hide children and does not bring back all parent rows when re-clicked', async () => {
      const { store, getByTestId, queryByTestId, user } = renderResult;
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
      const { store, getByTestId } = renderResult;
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
      const { store, getByTestId, queryByTestId, user } = renderResult;
      const { masterClasses, classes } = store.getState().class;

      await user.click(getByTestId(`expand-${masterClasses[0].id}`));

      expect(getByTestId('masterClass-breadcrumb')).toBeInTheDocument();
      expect(getByTestId(`row-${classes[0].id}`)).toBeInTheDocument();

      await user.click(getByTestId(`title-${masterClasses[0].id}`));

      expect(getByTestId('masterClass-breadcrumb')).toBeInTheDocument();
      expect(queryByTestId(`row-${classes[0].id}`)).toBeNull();
    });

    describe('PlanningHeader', () => {
      it('renders all elements', async () => {
        const { store, getByTestId } = renderResult;
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
      it('renders budget, overrun and deviation only for the current year', async () => {
        const { store, getByTestId } = renderResult;
        const { id } = store.getState().class.masterClasses[0];
        const firstCell = getByTestId(`row-${id}`).children[1];

        const year = new Date().getFullYear();

        expect(firstCell.children[0].children.length).toBe(3);

        expect(getByTestId(`budget-${id}-${year}`)).toBeInTheDocument();
        expect(getByTestId(`overrun-${id}-${year}`)).toBeInTheDocument();
        expect(getByTestId(`deviation-${id}-${year}`)).toBeInTheDocument();
      });

      it('renders budget and realized cost for future years', async () => {
        const { store, getByTestId } = renderResult;
        const { id } = store.getState().class.masterClasses[0];
        const secondCell = getByTestId(`row-${id}`).children[2];

        const year = new Date().getFullYear() + 1;

        expect(secondCell.children[0].children.length).toBe(2);

        expect(getByTestId(`budget-${id}-${year}`)).toBeInTheDocument();
        expect(getByTestId(`realized-${id}-${year}`)).toBeInTheDocument();
      });
    });

    describe('NameTooltip', () => {
      it.skip('FIXME is hidden by default and displays the current rows title on hover', async () => {
        const { store, getByTestId, user } = renderResult;
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
      it('renders all the elements and no financial data to cells if there is no planning or construction', async () => {
        const { user, store, getByTestId } = renderResult;
        const { masterClasses, classes } = store.getState().class;
        const { id, category, name, finances } = mockPlanningViewProjects.data.results[0];

        await waitFor(() => user.click(getByTestId(`expand-${masterClasses[0].id}`)));
        await waitFor(() => user.click(getByTestId(`expand-${classes[0].id}`)));

        await waitFor(() => {
          expect(getByTestId(`row-${id}`)).toBeInTheDocument();
          expect(getByTestId(`head-${id}`)).toBeInTheDocument();
          expect(getByTestId(`edit-phase-${id}`)).toBeInTheDocument();
          expect(getByTestId(`navigate-${id}`)).toHaveTextContent(name);
          expect(getByTestId(`category-${id}`)).toHaveTextContent((category as IListItem).value);
          expect(getByTestId(`project-total-budget-${id}`)).toBeInTheDocument();
          expect(getByTestId(`project-realized-budget-${id}`)).toBeInTheDocument();
        });

        for (let i = 0; i < 10; i++) {
          const year = finances.year + i;
          expect(getByTestId(`project-cell-${year}-${id}`)).toBeInTheDocument();
          expect(getByTestId(`cell-input-${year}-${id}`)).toBeDisabled();
        }
      });

      it('doesnt render the project category if there is no category', async () => {
        const { user, store, getByTestId, queryByTestId } = renderResult;
        const { masterClasses, classes } = store.getState().class;
        const { id } = mockPlanningViewProjects.data.results[1];

        await user.click(getByTestId(`expand-${masterClasses[0].id}`));
        await user.click(getByTestId(`expand-${classes[0].id}`));

        await waitFor(() => {
          expect(queryByTestId(`category-${id}`)).toBeNull();
        });
      });

      it('can patch the project phase with the custom context menu', async () => {
        const { user, store, getByTestId } = renderResult;
        const { masterClasses, classes } = store.getState().class;
        const { id } = mockPlanningViewProjects.data.results[0];

        await user.click(getByTestId(`expand-${masterClasses[0].id}`));
        await user.click(getByTestId(`expand-${classes[0].id}`));

        await waitFor(async () => await user.click(getByTestId(`edit-phase-${id}`)));

        await waitFor(() => expect(getByTestId('custom-context-menu')).toBeInTheDocument());
      });

      it('creates cells for planning, construction and overlap when the project has planning', async () => {
        const { user, store, getByTestId } = renderResult;
        const { masterClasses, classes } = store.getState().class;
        const { id, finances } = mockPlanningViewProjects.data.results[1];

        await user.click(getByTestId(`expand-${masterClasses[0].id}`));
        await user.click(getByTestId(`expand-${classes[0].id}`));

        await waitFor(() => {
          for (let i = 0; i < 10; i++) {
            const year = finances.year + i;
            const cell = getByTestId(`project-cell-${year}-${id}`);
            const input = getByTestId(`cell-input-${year}-${id}`);
            if (i === 0 || i >= 6) {
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
          }
        });
      });

      describe('ProjectCell', () => {
        it('active project cells can be edited and patched and the initial 0 value will be replaced by user input', async () => {
          const { user, store, getByTestId } = renderResult;
          const year = new Date().getFullYear();
          const mockFinancePatch = {
            data: {
              finances: {
                year: year,
                budgetProposalCurrentYearPlus1: '40.00',
              },
            },
          };

          mockedAxios.patch.mockResolvedValueOnce(mockFinancePatch);

          const { masterClasses, classes } = store.getState().class;
          const { id } = mockPlanningViewProjects.data.results[1];

          await user.click(getByTestId(`expand-${masterClasses[0].id}`));
          await user.click(getByTestId(`expand-${classes[0].id}`));

          const input = await waitFor(() => getByTestId(`cell-input-${year + 1}-${id}`));

          await user.click(input);
          await user.type(input, '40');
          await user.click(getByTestId(`cell-input-${year}-${id}`));

          await waitFor(() => {
            const patchMock = mockedAxios.patch.mock;
            expect(patchMock.lastCall[0]).toBe('localhost:4000/projects/planning-project-2/');
            expect(input).toHaveValue(
              asNumber(mockFinancePatch.data.finances.budgetProposalCurrentYearPlus1),
            );
          });
        });
      });

      // TODO: open context menu and delete a cell (con, plan, overlap)
      // TODO: open context menu and modify a cell
      // TODO: add a year
      // TODO: move timeline by one year forward
      // TODO: move timeline by one year backwards
    });
  });
});
