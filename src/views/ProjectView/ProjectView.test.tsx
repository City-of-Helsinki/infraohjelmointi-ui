import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import ProjectView from './ProjectView';
import { getProjectThunk } from '@/reducers/projectSlice';
import { renderWithProviders, sendProjectUpdateEvent } from '@/utils/testUtils';
import { IError } from '@/interfaces/common';
import { mockError } from '@/mocks/mockError';
import { act } from 'react-dom/test-utils';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { Route } from 'react-router';
import { ProjectBasics } from '@/components/Project/ProjectBasics';
import { ProjectNotes } from '@/components/Project/ProjectNotes';
import PlanningView from '../PlanningView/PlanningView';
import { setupStore } from '@/store';
import { IProject } from '@/interfaces/projectInterfaces';
import { addProjectUpdateEventListener, removeProjectUpdateEventListener } from '@/utils/events';
import { waitFor } from '@testing-library/react';

const store = setupStore();

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <Route path="/" element={<ProjectView />}>
        <Route path="/projects/:projectId" element={<ProjectView />}>
          <Route path="basics" element={<ProjectBasics />} />
          <Route path="notes" element={<ProjectNotes />} />
        </Route>
        <Route path="/planning" element={<PlanningView />} />
      </Route>,

      {
        preloadedState: {
          project: { ...store.getState().project, selectedProject: mockProject.data },
        },
      },
    ),
  );

describe('ProjectView', () => {
  beforeEach(() => {
    mockGetResponseProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('has all needed data in store', async () => {
    const { store } = await render();

    expect(store.getState().project.selectedProject).toStrictEqual(mockProject.data);
  });

  it('listens to projectUpdate in redux and sets the selectedProject when it changes: ', async () => {
    const { store } = await render();

    addProjectUpdateEventListener(store.dispatch);

    const updatedProject: IProject = { ...mockProject.data, name: 'New name' };

    await sendProjectUpdateEvent(updatedProject);

    await waitFor(() => {
      expect(store.getState().project.selectedProject).toStrictEqual(updatedProject);
    });

    removeProjectUpdateEventListener(store.dispatch);
  });
  it('renders the parent container', async () => {
    const { getByTestId } = await render();

    expect(getByTestId('project-view')).toBeInTheDocument();
  });

  it('renders the ProjectToolbar', async () => {
    const { getByTestId } = await render();

    expect(getByTestId('toolbar')).toBeInTheDocument();
  });

  it('renders the ProjectHeader', async () => {
    const { getByTestId } = await render();

    expect(getByTestId('project-header')).toBeInTheDocument();
  });

  it('renders the ProjectTabs', async () => {
    const { findByTestId } = await render();

    expect(await findByTestId('tabs-list')).toBeInTheDocument();
  });

  it('catches a failed project  fetch', async () => {
    const { store } = await render();

    mockedAxios.get.mockRejectedValueOnce(mockError);

    await act(() => store.dispatch(getProjectThunk(mockProject.data.id)));

    const storeError = store.getState().project.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
