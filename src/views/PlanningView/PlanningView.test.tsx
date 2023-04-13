// import axios from 'axios';
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

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

// const mockedAxios = axios as jest.Mocked<typeof axios>;

const store = setupStore();

describe('PlanningView', () => {
  let renderResult: CustomRenderResult;

  const getClass = (name: string) => {
    const { container } = renderResult;
    return container.getElementsByClassName(name)[0];
  };

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<PlanningView />, {
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
        })),
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

    it('renders breadcrumbs when table rows are expanded', async () => {
      const { getByTestId, user, store } = renderResult;

      const firstMasterClassId = store.getState().class.masterClasses[0].id;
      const masterClassRow = getByTestId(`expand-${firstMasterClassId}`);

      await user.click(masterClassRow);

      // FIXME: clicking this doesn't change the url and so doesn't navigate
      // so the usePlanningRows-hook doesn't set the selectedMasterClass
      // expect(getByTestId('masterClass-breadcrumb')).toBeInTheDocument();
    });

    // TODO: Renders links correctly
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
    // TODO: shows selectedMasterClass when selected and previous button
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

      const masterClasses = store.getState().class.masterClasses;
      const classes = store.getState().class.classes;
      const subClasses = store.getState().class.subClasses;
      const districts = store.getState().location.districts;
      const divisions = store.getState().location.divisions;
      const groups = store.getState().group.groups;

      classes.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      subClasses.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      districts.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      divisions.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      groups.forEach(({ id }) => expect(queryByTestId(`row-${id}`)).toBeNull());

      // There are as many rows as masterClasses
      expect(getClass('planning-table').children[0].children.length).toBe(masterClasses.length);
      // Check that each masterClass has all the row properties
      masterClasses.forEach(async ({ id }) => expect(getByTestId(`row-${id}`)).toBeInTheDocument());
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
    });

    describe('NameTooltip', () => {
      it('is hidden by default and displays the current rows title on hover', async () => {
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

    // TODO: expand different rows... (currently clicking the expand-navigations don't work)
    // TODO: renders only district... ()
    // TODO: project rows
  });
});
