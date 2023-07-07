import {
  mockCoordinatorClasses,
  mockCoordinatorCollectiveSubLevels,
  mockCoordinatorMasterClasses,
  mockCoordinatorOtherClassificationSubLevels,
  mockCoordinatorOtherClassifications,
  mockCoordinatorSubClasses,
  mockProjectCoordinatorClasses,
} from '@/mocks/mockClasses';
import mockI18next from '@/mocks/mockI18next';
import { RootState, setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import PlanningView from './PlanningView';
import { mockCoordinatorDistricts } from '@/mocks/mockLocations';
import { mockProjectPhases } from '@/mocks/mockLists';
import { mockGroups } from '@/mocks/mockGroups';
import { Route } from 'react-router';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { act, waitFor } from '@testing-library/react';
import { CustomContextMenu } from '@/components/CustomContextMenu';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());
jest.setTimeout(7000);

const store = setupStore();

const defaultState: RootState = {
  ...store.getState(),
  class: {
    ...store.getState().class,
    coordination: {
      ...store.getState().class.coordination,
      allClasses: mockProjectCoordinatorClasses.data,
      masterClasses: mockCoordinatorMasterClasses.data,
      classes: mockCoordinatorClasses.data,
      subClasses: mockCoordinatorSubClasses.data,
      collectiveSubLevels: mockCoordinatorCollectiveSubLevels.data,
      otherClassifications: mockCoordinatorOtherClassifications.data,
      otherClassificationSubLevels: mockCoordinatorOtherClassificationSubLevels.data,
    },
  },
  location: {
    ...store.getState().location,
    coordination: {
      ...store.getState().location.coordination,
      districts: mockCoordinatorDistricts.data,
    },
  },
  group: {
    ...store.getState().group,
    groups: mockGroups.data,
  },
  lists: {
    ...store.getState().lists,
    phases: mockProjectPhases.data,
  },
  planning: {
    ...store.getState().planning,
    mode: 'coordination',
  },
};

const getAllRowsExpandedRoute = () => {
  const masterClassId = mockCoordinatorMasterClasses.data[0].id;
  const classId = mockCoordinatorClasses.data[0].id;
  const subClassId = mockCoordinatorSubClasses.data[0].id;
  const collectiveSubLevelId = mockCoordinatorCollectiveSubLevels.data[0].id;
  const subLevelDistrictId = mockCoordinatorDistricts.data[1].id;

  return `/coordination/?masterClass=${masterClassId}&class=${classId}&subClass=${subClassId}&collectiveSubLevel=${collectiveSubLevelId}&subLevelDistrict=${subLevelDistrictId}`;
};

const render = async (customState?: object | null, customRoute?: string) =>
  await act(async () =>
    renderWithProviders(
      <>
        <Route
          path="/"
          element={
            <>
              <PlanningView />
              <CustomContextMenu />
            </>
          }
        >
          <Route path="/coordination" element={<PlanningView />} />
        </Route>
      </>,
      {
        preloadedState: customState ?? defaultState,
      },
      { route: customRoute ? customRoute : '/coordination' },
    ),
  );

describe('CoordinatorView', () => {
  beforeEach(() => {
    mockGetResponseProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the container in coordination mode', async () => {
    const { container } = await render();

    expect(container.getElementsByClassName('planning-view-container')[0]).toBeInTheDocument();
  });

  describe('PlanningBreadCrumbs', () => {
    it('renders the breadcrumbs in coordination mode', async () => {
      const { findByTestId } = await render();

      expect(await findByTestId('planning-breadcrumbs')).toBeInTheDocument();
      expect(await findByTestId('coordination-breadcrumb')).toBeInTheDocument();
    });

    it('renders all coordinator breadcrumb levels', async () => {
      const { findByTestId, user, store } = await render(null, getAllRowsExpandedRoute());

      const otherClassificationId = store.getState().class.coordination.otherClassifications[0].id;

      expect(await findByTestId('masterClass-breadcrumb')).toBeInTheDocument();
      expect(await findByTestId('class-breadcrumb')).toBeInTheDocument();
      expect(await findByTestId('subClass-breadcrumb')).toBeInTheDocument();
      expect(await findByTestId('collectiveSubLevel-breadcrumb')).toBeInTheDocument();
      expect(await findByTestId('subLevelDistrict-breadcrumb')).toBeInTheDocument();

      await user.click(await findByTestId('previous-button'));

      await user.click(await findByTestId(`expand-${otherClassificationId}`));

      expect(await findByTestId('otherClassification-breadcrumb')).toBeInTheDocument();
    });
  });

  describe('PlanningInfoPanel', () => {
    it('renders the planning info panel in coordination mode', async () => {
      const { findByTestId } = await render();

      expect(await findByTestId('mode-button-container')).toHaveTextContent('coordination');
    });
  });

  describe('PlanningToolbar', () => {
    it('has all buttons as disabled', async () => {
      const { findByTestId } = await render();

      expect(await findByTestId('expand-groups-button')).toBeDisabled();
      expect(await findByTestId('new-item-button')).toBeDisabled();
    });
  });

  describe('PlanningTable', () => {
    it('renders all the coordination levels', async () => {
      const { findByTestId, store, user, queryByTestId } = await render();

      const {
        masterClasses,
        classes,
        subClasses,
        collectiveSubLevels,
        otherClassifications,
        otherClassificationSubLevels,
      } = store.getState().class.coordination;

      const { districts } = store.getState().location.coordination;

      masterClasses.forEach(async ({ id }) =>
        expect(await findByTestId(`row-${id}`)).toBeInTheDocument(),
      );

      // Click masterClass and expect class
      await user.click(await findByTestId(`expand-${masterClasses[0].id}`));

      expect(await findByTestId(`row-${classes[0].id}`)).toBeInTheDocument();

      // Click class and expect subClass
      await user.click(await findByTestId(`expand-${classes[0].id}`));

      expect(await findByTestId(`row-${subClasses[0].id}`)).toBeInTheDocument();

      // Click subClass and expect district and collective sub level
      await user.click(await findByTestId(`expand-${subClasses[0].id}`));

      expect(await findByTestId(`row-${collectiveSubLevels[0].id}`)).toBeInTheDocument();
      expect(await findByTestId(`row-${districts[0].id}`)).toBeInTheDocument();

      // Click district and expect collective sub level to disappear
      await user.click(await findByTestId(`expand-${districts[0].id}`));

      await waitFor(() => {
        expect(queryByTestId(`row-${collectiveSubLevels[0].id}`)).toBeNull();
      });

      // navigate back one level to get collective sub levels back
      await user.click(await findByTestId('previous-button'));

      // Click collective sub level and expect other classification and sub level district and hides the district
      await user.click(await findByTestId(`expand-${collectiveSubLevels[0].id}`));

      expect(await findByTestId(`row-${otherClassifications[0].id}`)).toBeInTheDocument();
      expect(await findByTestId(`row-${districts[1].id}`)).toBeInTheDocument();

      await waitFor(() => {
        expect(queryByTestId(`row-${districts[0].id}`)).toBeNull();
      });

      // Click other classification and expect other classification sub level
      await user.click(await findByTestId(`expand-${otherClassifications[0].id}`));

      expect(await findByTestId(`row-${otherClassificationSubLevels[0].id}`)).toBeInTheDocument();
    });
  });
});
