import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import ProjectView from './ProjectView';
import { getProjectThunk } from '@/reducers/projectSlice';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { IError } from '@/interfaces/common';
import { mockError } from '@/mocks/mockError';
import { act } from 'react-dom/test-utils';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { Route } from 'react-router';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectView', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    mockGetResponseProvider();
    await act(
      async () =>
        (renderResult = renderWithProviders(<Route path="/" element={<ProjectView />} />)),
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('has all needed data in store', async () => {
    const { store } = renderResult;

    expect(store.getState().project.selectedProject).toStrictEqual(mockProject.data);
  });

  it('renders the parent container', () => {
    const { getByTestId } = renderResult;
    expect(getByTestId('project-view')).toBeInTheDocument();
  });

  it('renders the ProjectToolbar', () => {
    const { getByTestId } = renderResult;
    expect(getByTestId('toolbar')).toBeInTheDocument();
  });

  it('renders the ProjectHeader', () => {
    const { getByTestId } = renderResult;
    expect(getByTestId('project-header')).toBeInTheDocument();
  });

  it('renders the ProjectTabs', async () => {
    const { findByTestId } = renderResult;
    expect(await findByTestId('tabs-list')).toBeInTheDocument();
  });

  it('catches a failed project  fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValueOnce(mockError);
    await act(() => store.dispatch(getProjectThunk(mockProject.data.id)));

    const storeError = store.getState().project.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
