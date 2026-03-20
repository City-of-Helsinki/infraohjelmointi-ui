import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import ProjectView from './ProjectView';
import { renderWithProviders } from '@/utils/testUtils';
import { IError } from '@/interfaces/common';
import { mockError } from '@/mocks/mockError';
import { act } from 'react-dom/test-utils';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { Route } from 'react-router';
import { ProjectNotes } from '@/components/Project/ProjectNotes';
import { setupStore } from '@/store';
import { ProjectBasics } from '@/components/Project/ProjectBasics';
import { projectApi } from '@/api/projectApi';
import { mockUser } from '@/mocks/mockUsers';

const store = setupStore();

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios> & jest.MockedFunction<typeof axios>;

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <Route path="/projects/:projectId" element={<ProjectView />}>
        <Route path="basics" element={<ProjectBasics />} />
        <Route path="new" element={<ProjectBasics />} />
        <Route path="notes" element={<ProjectNotes />} />
      </Route>,

      {
        preloadedState: {
          project: { ...store.getState().project },
          auth: { user: mockUser.data, error: null },
        },
      },
      { route: `/projects/${mockProject.data.id}/basics` },
    ),
  );

describe('ProjectView', () => {
  beforeEach(() => {
    mockGetResponseProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the parent container', async () => {
    const { getByTestId } = await render();

    expect(getByTestId('project-view')).toBeInTheDocument();
  });

  it('renders the ProjectHeader', async () => {
    const { findByTestId } = await render();

    expect(await findByTestId('project-header')).toBeInTheDocument();
  });

  it('renders the ProjectTabs', async () => {
    const { findByTestId } = await render();

    expect(await findByTestId('tabs-list')).toBeInTheDocument();
  });

  it('catches a failed project fetch', async () => {
    const { store } = await render();

    store.dispatch(projectApi.util.resetApiState());

    mockedAxios.mockRejectedValueOnce({
      response: {
        status: mockError.status,
        data: mockError,
      },
      message: mockError.message,
    });

    await act(async () => {
      const result = store.dispatch(
        projectApi.endpoints.getProjectById.initiate(mockProject.data.id),
      );

      try {
        await result.unwrap();
      } catch {
        // expected rejection for this test
      } finally {
        result.unsubscribe();
      }
    });

    const storeError = store.getState().project.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
