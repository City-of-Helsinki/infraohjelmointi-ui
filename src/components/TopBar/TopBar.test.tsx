import mockI18next from '@/mocks/mockI18next';
import TopBar from './TopBar';
import { renderWithProviders } from '@/utils/testUtils';
import { matchExact } from '@/utils/common';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { Route } from 'react-router';
import ProjectView from '@/views/ProjectView/ProjectView';
import PlanningView from '@/views/PlanningView/PlanningView';
import { setupStore } from '@/store';
import mockProject from '@/mocks/mockProject';
import * as mockLists from '@/mocks/mockLists';

jest.mock('react-i18next', () => mockI18next());
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const store = setupStore();

const render = async (customRoute?: string) =>
  await act(async () =>
    renderWithProviders(
      <>
        <Route path="/" element={<TopBar />}></Route>
        <Route
          path="/project/:projectId/basics"
          element={
            <>
              <TopBar />
              <ProjectView />
            </>
          }
        ></Route>
        <Route path="/planning" element={<PlanningView />}></Route>
      </>,

      {
        preloadedState: {
          auth: { user: null, error: {} },
          project: { ...store.getState().project, selectedProject: mockProject.data },
          lists: {
            areas: mockLists.mockProjectAreas.data,
            phases: mockLists.mockProjectPhases.data,
            types: mockLists.mockProjectTypes.data,
            constructionPhaseDetails: mockLists.mockConstructionPhaseDetails.data,
            categories: mockLists.mockProjectCategories.data,
            riskAssessments: mockLists.mockProjectRisks.data,
            projectQualityLevels: mockLists.mockProjectQualityLevels.data,
            planningPhases: mockLists.mockPlanningPhases.data,
            constructionPhases: mockLists.mockConstructionPhases.data,
            responsibleZones: mockLists.mockResponsibleZones.data,
            responsiblePersons: mockLists.mockResponsiblePersons.data,
            programmedYears: [],
            projectDistricts: [],
            projectDivisions: [],
            projectSubDivisions: [],
            error: {},
          },
        },
      },
      { route: customRoute ? customRoute : '/' },
    ),
  );

describe('TopBar', () => {
  it('renders component wrapper', async () => {
    const { getByTestId } = await render();

    expect(getByTestId('top-bar')).toBeInTheDocument();
  });

  it('renders all content', async () => {
    const { getByTestId, getByRole, getAllByRole } = await render();

    expect(getByTestId('top-bar')).toBeInTheDocument();
    expect(getByRole('link', { name: matchExact('nav.skipToContent') })).toBeInTheDocument();
    expect(getByRole('button', { name: matchExact('nav.search') })).toBeInTheDocument();
    expect(getAllByRole('button', { name: matchExact('nav.login') })[0]).toBeInTheDocument();
    expect(getByRole('img')).toBeInTheDocument();
  });

  it('doesnt render the back button when not on the project route', async () => {
    const { queryByTestId } = await render();

    expect(queryByTestId('top-bar-back-button')).toBeNull();
  });

  it('renders the back button when the project route', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockProject);

    const { getByTestId, user } = await render(`/project/${mockProject.data.id}/basics`);

    expect(getByTestId('top-bar-back-button')).toBeInTheDocument();

    await user.click(getByTestId('top-bar-back-button'));
  });
});
