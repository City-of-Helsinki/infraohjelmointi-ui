import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectHeader from './ProjectHeader';
import axios from 'axios';
import { setupStore } from '@/store';
import mockProject from '@/mocks/mockProject';
import { IProject } from '@/interfaces/projectInterfaces';
import { matchExact } from '@/utils/common';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectHeader', () => {
  const store = setupStore({
    project: {
      projects: [mockProject.data],
      selectedProject: mockProject.data,
      count: 1,
      error: {},
      page: 1,
      updated: null,
    },
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders all component wrappers', () => {
    const { container } = renderWithProviders(<ProjectHeader />, { store });

    expect(container.getElementsByClassName('project-header-container').length).toBe(1);
    expect(container.getElementsByClassName('left').length).toBe(1);
    expect(container.getElementsByClassName('left-wrapper').length).toBe(1);
    expect(container.getElementsByClassName('center').length).toBe(1);
    expect(container.getElementsByClassName('center-wrapper').length).toBe(1);
    expect(container.getElementsByClassName('right').length).toBe(1);
    expect(container.getElementsByClassName('right-wrapper').length).toBe(1);
  });

  it('renders all left side elements', async () => {
    const { getByRole, getByText } = renderWithProviders(<ProjectHeader />, { store });

    const project = store.getState().project.selectedProject as IProject;
    const { projectReadiness, name, phase, address } = project;

    expect(getByRole('button', { name: /edit-project-name/i })).toBeInTheDocument();
    expect(getByText(matchExact(name))).toBeInTheDocument();
    expect(getByText(matchExact(phase.value))).toBeInTheDocument();
    expect(getByText(matchExact(`${projectReadiness}%`))).toBeInTheDocument();
    expect(getByText(matchExact(address || ''))).toBeInTheDocument();
  });

  it('renders all right side elements', async () => {
    const { getByRole, getByText, container } = renderWithProviders(<ProjectHeader />, {
      store,
    });

    expect(container.getElementsByClassName('favourite-button-container').length).toBe(1);
    expect(getByRole('button', { name: /addFavourite/i })).toBeInTheDocument();
    expect(getByText(/inGroup/i)).toBeInTheDocument();
    expect(getByText(matchExact('Hakaniemi'))).toBeInTheDocument();
  });

  it('can autosave patch a form value', async () => {
    const { queryByRole, getByRole, user, getByText } = renderWithProviders(<ProjectHeader />, {
      store,
    });
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
