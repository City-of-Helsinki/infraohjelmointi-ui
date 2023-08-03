import mockI18next from '@/mocks/mockI18next';
import TopBar from './TopBar';
import { renderWithProviders } from '@/utils/testUtils';
import { matchExact } from '@/utils/common';
import mockPersons from '@/mocks/mockPersons';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { waitFor } from '@testing-library/react';
import { getUserThunk } from '@/reducers/authSlice';
import { Route } from 'react-router';
import ProjectView from '@/views/ProjectView/ProjectView';
import PlanningView from '@/views/PlanningView/PlanningView';
import { setupStore } from '@/store';
import mockProject from '@/mocks/mockProject';

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
          path="/project/:projectId"
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
    expect(getByRole('button', { name: matchExact('menu') })).toBeInTheDocument();
    expect(getByRole('button', { name: matchExact('nav.search') })).toBeInTheDocument();
    expect(getAllByRole('button', { name: matchExact('nav.login') })[0]).toBeInTheDocument();
    expect(getByRole('button', { name: matchExact('nav.notifications') })).toBeInTheDocument();
    expect(getByRole('img')).toBeInTheDocument();
  });

  it('render username if user is found', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPersons.data });

    const { getByRole, store, queryByRole } = await render();

    await waitFor(() => store.dispatch(getUserThunk()));

    expect(
      getByRole('button', {
        name: `${mockPersons.data[0].firstName} ${mockPersons.data[0].lastName}`,
      }),
    ).toBeInTheDocument();

    expect(queryByRole('button', { name: matchExact('nav.login') })).toBeNull();
  });

  it('doesnt render the back button when not on the project route', async () => {
    const { queryByTestId } = await render();

    expect(queryByTestId('top-bar-back-button')).toBeNull();
  });

  it('renders the back button when the project route', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockProject);

    const { getByTestId, user } = await render(`/project/${mockProject.data.id}`);

    expect(getByTestId('top-bar-back-button')).toBeInTheDocument();

    await user.click(getByTestId('top-bar-back-button'));
  });
});
