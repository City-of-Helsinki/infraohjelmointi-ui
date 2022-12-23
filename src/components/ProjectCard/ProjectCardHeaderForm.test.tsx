import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardHeaderForm from './ProjectCardHeaderForm';
import axios from 'axios';
import { setupStore } from '@/store';
import mockProjectCard from '@/mocks/mockProjectCard';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { matchExact } from '@/utils/common';
import { waitFor } from '@testing-library/react';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

const AUTOSAVE_TIMEOUT = 3500;

describe('ProjectCardHeaderForm', () => {
  const store = setupStore({
    projectCard: {
      projectCards: [mockProjectCard.data as IProjectCard],
      selectedProjectCard: mockProjectCard.data as IProjectCard,
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
    const { container } = renderWithProviders(<ProjectCardHeaderForm />, { store });

    expect(container.getElementsByClassName('project-card-header-container').length).toBe(1);
    expect(container.getElementsByClassName('left').length).toBe(1);
    expect(container.getElementsByClassName('left-wrapper').length).toBe(1);
    expect(container.getElementsByClassName('center').length).toBe(1);
    expect(container.getElementsByClassName('center-wrapper').length).toBe(1);
    expect(container.getElementsByClassName('right').length).toBe(1);
    expect(container.getElementsByClassName('right-wrapper').length).toBe(1);
  });

  it('renders all left side elements', async () => {
    const { getByRole, getByText } = renderWithProviders(<ProjectCardHeaderForm />, { store });

    const projectCard = store.getState().projectCard.selectedProjectCard as IProjectCard;
    const { projectReadiness, name, phase, address } = projectCard;

    expect(getByRole('button', { name: /edit-project-name/i })).toBeInTheDocument();
    expect(getByText(matchExact(name))).toBeInTheDocument();
    expect(getByText(matchExact(phase.value))).toBeInTheDocument();
    expect(getByText(matchExact(`${projectReadiness}%`))).toBeInTheDocument();
    expect(getByText(matchExact(address || ''))).toBeInTheDocument();
  });

  it('renders all right side elements', async () => {
    const { getByRole, getByText, container } = renderWithProviders(<ProjectCardHeaderForm />, {
      store,
    });

    expect(container.getElementsByClassName('favourite-button-container').length).toBe(1);
    expect(getByRole('button', { name: /addFavourite/i })).toBeInTheDocument();
    expect(getByText(/inGroup/i)).toBeInTheDocument();
    expect(getByText(matchExact('Hakaniemi'))).toBeInTheDocument();
  });

  it('can autosave patch a form value', async () => {
    const { queryByRole, getByRole, user, getByText } = renderWithProviders(
      <ProjectCardHeaderForm />,
      {
        store,
      },
    );
    const expectedValue = 'New name';
    const projectCard = mockProjectCard.data;

    const responseProjectCard: IProjectCard = {
      ...projectCard,
      name: expectedValue,
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

    // Open edit mode
    await user.click(getByRole('button', { name: /edit-project-name/i }));

    const nameField = getByRole('textbox', { name: 'project-card-name' });

    await user.clear(nameField);
    await user.type(nameField, expectedValue);

    // Close edit mode
    await user.click(getByRole('button', { name: /edit-project-name/i }));
    expect(queryByRole('textbox')).toBeNull();

    await waitFor(
      () => {
        const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProjectCard;
        expect(formPatchRequest.name).toEqual(expectedValue);
        expect(getByText(matchExact(expectedValue))).toBeInTheDocument();
      },
      { timeout: AUTOSAVE_TIMEOUT },
    );
  });
});
