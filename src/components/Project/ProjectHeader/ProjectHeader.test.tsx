import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectHeader from './ProjectHeader';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { IProject } from '@/interfaces/projectInterfaces';
import { matchExact } from '@/utils/common';
import { act } from 'react-dom/test-utils';
import { Route } from 'react-router';
import { setupStore } from '@/store';
import { mockGroups } from '@/mocks/mockGroups';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

const store = setupStore();

const render = async () =>
  await act(async () =>
    renderWithProviders(<Route path="/" element={<ProjectHeader />} />, {
      preloadedState: {
        project: {
          selectedProject: mockProject.data,
          count: 1,
          error: {},
          page: 1,
          isSaving: false,
          mode: 'edit',
        },
        group: {
          ...store.getState().group,
          planning: { ...store.getState().group.planning, groups: mockGroups.data },
        },
      },
    }),
  );

describe('ProjectHeader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all component wrappers', async () => {
    const { getByTestId } = await render();

    expect(getByTestId('project-header')).toBeInTheDocument();
    expect(getByTestId('project-header-left')).toBeInTheDocument();
    expect(getByTestId('project-header-center')).toBeInTheDocument();
    expect(getByTestId('project-header-right')).toBeInTheDocument();
  });

  it('renders all left side elements', async () => {
    const { getByRole, getByText, store, getByTestId } = await render();

    const project = store.getState().project.selectedProject as IProject;
    const { projectReadiness, name, phase, address } = project;

    expect(getByRole('button', { name: /edit-project-name/i })).toBeInTheDocument();
    expect(getByTestId('project-header-name-fields')).toHaveTextContent(matchExact(name));
    expect(getByText(matchExact(phase.value))).toBeInTheDocument();
    expect(getByText(matchExact(`${projectReadiness}%`))).toBeInTheDocument();
    expect(getByText(matchExact(address || ''))).toBeInTheDocument();
  });

  it('renders all right side elements', async () => {
    const { getByRole, getByText, getByTestId } = await render();

    expect(getByTestId('project-favourite')).toBeInTheDocument();
    expect(getByRole('button', { name: /addFavourite/i })).toBeInTheDocument();
    expect(getByText(/inGroup/i)).toBeInTheDocument();
    expect(getByText('Test Group 1')).toBeInTheDocument();
  });

  it('can autosave patch a form value', async () => {
    const { queryByRole, getByRole, user, getByText } = await render();
    const expectedName = 'New name';
    const expectedAddress = 'New address 123';
    const expectedPostalCode = '00100';
    const expectedCity = 'Helsinki';
    const project = mockProject.data;

    const responseProject: IProject = {
      ...project,
      name: expectedName,
      address: expectedAddress,
      postalCode: expectedPostalCode,
      city: expectedCity,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProject));

    // Open edit mode
    await user.click(getByRole('button', { name: /edit-project-name/i }));

    const nameField = getByRole('textbox', { name: 'project-name' });
    const addressField = getByRole('textbox', { name: 'project-address' });
    const postalCodeField = getByRole('textbox', { name: 'project-postal-code' });
    const cityField = getByRole('textbox', { name: 'project-city' });

    await user.clear(nameField);
    await user.type(nameField, expectedName);
    await user.clear(addressField);
    await user.type(addressField, expectedAddress);
    await user.type(postalCodeField, expectedPostalCode);
    await user.type(cityField, expectedCity);

    // Close edit mode
    await user.click(getByRole('button', { name: /edit-project-name/i }));
    expect(queryByRole('textbox')).toBeNull();

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProject;
    expect(formPatchRequest.name).toEqual(expectedName);
    expect(getByText(matchExact(expectedName))).toBeInTheDocument();
    expect(formPatchRequest.address).toEqual(expectedAddress);
    expect(getByText(matchExact(expectedAddress))).toBeInTheDocument();
    expect(formPatchRequest.postalCode).toEqual(expectedPostalCode);
    expect(getByText(matchExact(expectedPostalCode))).toBeInTheDocument();
    expect(formPatchRequest.city).toEqual(expectedCity);
    expect(getByText(matchExact(expectedCity))).toBeInTheDocument();
  });
});
