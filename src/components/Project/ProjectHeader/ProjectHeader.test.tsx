import mockI18next from '@/mocks/mockI18next';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import ProjectHeader from './ProjectHeader';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { IProject } from '@/interfaces/projectInterfaces';
import { matchExact } from '@/utils/common';
import { act } from 'react-dom/test-utils';
import { Route } from 'react-router';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectHeader', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<Route path="/" element={<ProjectHeader />} />, {
          preloadedState: {
            project: {
              projects: [],
              selectedProject: mockProject.data,
              count: 1,
              error: {},
              page: 1,
              updated: null,
            },
          },
        })),
    );
  });
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders all component wrappers', () => {
    const { getByTestId } = renderResult;

    expect(getByTestId('project-header')).toBeInTheDocument();
    expect(getByTestId('project-header-left')).toBeInTheDocument();
    expect(getByTestId('project-header-center')).toBeInTheDocument();
    expect(getByTestId('project-header-right')).toBeInTheDocument();
  });

  it('renders all left side elements', async () => {
    const { getByRole, getByText, store } = renderResult;

    const project = store.getState().project.selectedProject as IProject;
    const { projectReadiness, name, phase, address } = project;

    expect(getByRole('button', { name: /edit-project-name/i })).toBeInTheDocument();
    expect(getByText(matchExact(name))).toBeInTheDocument();
    expect(getByText(matchExact(phase.value))).toBeInTheDocument();
    expect(getByText(matchExact(`${projectReadiness}%`))).toBeInTheDocument();
    expect(getByText(matchExact(address || ''))).toBeInTheDocument();
  });

  it('renders all right side elements', async () => {
    const { getByRole, getByText, getByTestId } = renderResult;

    expect(getByTestId('project-favourite')).toBeInTheDocument();
    expect(getByRole('button', { name: /addFavourite/i })).toBeInTheDocument();
    expect(getByText(/inGroup/i)).toBeInTheDocument();
    expect(getByText(matchExact('Hakaniemi'))).toBeInTheDocument();
  });

  it('can autosave patch a form value', async () => {
    const { queryByRole, getByRole, user, getByText } = renderResult;
    const expectedValue = 'New name';
    const project = mockProject.data;

    const responseProject: IProject = {
      ...project,
      name: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProject));

    // Open edit mode
    await user.click(getByRole('button', { name: /edit-project-name/i }));

    const nameField = getByRole('textbox', { name: 'project-name' });

    await user.clear(nameField);
    await user.type(nameField, expectedValue);

    // Close edit mode
    await user.click(getByRole('button', { name: /edit-project-name/i }));
    expect(queryByRole('textbox')).toBeNull();

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.name).toEqual(expectedValue);
    expect(getByText(matchExact(expectedValue))).toBeInTheDocument();
  });
});
