import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardHeader from './ProjectCardHeader';
import axios from 'axios';
import { setupStore } from '@/store';
import mockProjectCard from '@/mocks/mockProjectCard';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';
import { matchExact } from '@/utils/common';
import userEvent from '@testing-library/user-event';
import { mockProjectPhases } from '@/mocks/mockLists';
import { getProjectPhasesThunk } from '@/reducers/listsSlice';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectCardHeader', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCard);
    await store.dispatch(getProjectCardThunk(mockProjectCard.data.id));

    mockedAxios.get.mockResolvedValue(mockProjectPhases);
    await store.dispatch(getProjectPhasesThunk());
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders all component wrappers', () => {
    const { container } = renderWithProviders(<ProjectCardHeader />, { store });

    expect(container.getElementsByClassName('project-card-header-container').length).toBe(1);
    expect(container.getElementsByClassName('left').length).toBe(1);
    expect(container.getElementsByClassName('left-wrapper').length).toBe(1);
    expect(container.getElementsByClassName('center').length).toBe(1);
    expect(container.getElementsByClassName('center-wrapper').length).toBe(1);
    expect(container.getElementsByClassName('right').length).toBe(1);
    expect(container.getElementsByClassName('right-wrapper').length).toBe(1);
  });

  it('renders all left side elements', async () => {
    const { getByRole, getByText } = renderWithProviders(<ProjectCardHeader />, { store });

    const projectCard = store.getState().projectCard.selectedProjectCard as IProjectCard;
    const { projectReadiness, name, phase } = projectCard;

    expect(getByRole('button', { name: /edit-project-name/i })).toBeInTheDocument();
    expect(getByText(matchExact(name))).toBeInTheDocument();
    expect(getByText(matchExact(phase.value))).toBeInTheDocument();
    expect(getByText(matchExact(`${projectReadiness}%`))).toBeInTheDocument();
    // TODO: check address
  });

  it('project name can be edited by clicking the edit button', async () => {
    const { getByRole, queryByRole, getAllByRole } = renderWithProviders(<ProjectCardHeader />, {
      store,
    });
    const user = userEvent.setup();

    // TODO: this needs to be tested better
    await user.click(getByRole('button', { name: /edit-project-name/i }));
    expect(getAllByRole('textbox').length).toBe(2);
    await user.click(getByRole('button', { name: /edit-project-name/i }));
    expect(queryByRole('textbox')).toBeNull();
  });

  it('renders all right side elements', async () => {
    const { getByRole, getByText, container } = renderWithProviders(<ProjectCardHeader />, {
      store,
    });

    expect(container.getElementsByClassName('favourite-button-container').length).toBe(1);
    expect(getByRole('button', { name: /addFavourite/i })).toBeInTheDocument();
    expect(getByText(/inGroup/i)).toBeInTheDocument();
    expect(getByText(matchExact('Hakaniemi'))).toBeInTheDocument();
  });

  it('can add and remove favourites', async () => {
    const { getByRole } = renderWithProviders(<ProjectCardHeader />, { store });
    const user = userEvent.setup();

    expect(getByRole('button', { name: /addFavourite/i })).toBeInTheDocument();
    await user.click(getByRole('button', { name: /addFavourite/i }));
    expect(getByRole('button', { name: /removeFavourite/i })).toBeInTheDocument();
  });

  it('can patch the header form', async () => {
    const { getByRole, user, getByText } = renderWithProviders(<ProjectCardHeader />, {
      store,
    });

    const projectCard = store.getState().projectCard.selectedProjectCard as IProjectCard;

    const responseProjectCard: IProjectCard = {
      ...projectCard,
      favPersons: ['9d6a0854-a784-44b0-ad35-ca5e8b8f0e90'],
      phase: { id: 'c0011fd1-89a5-491c-a6d2-f968b0384069', value: 'draftInitiation' },
      name: 'new name',
      address: 'new address',
    };

    mockedAxios.patch.mockResolvedValue(async () => await Promise.resolve(responseProjectCard));

    // Click add favourite
    await user.click(getByRole('button', { name: /addFavourite/i }));

    // Enable editing of address & name
    await user.click(getByRole('button', { name: /edit-project-name/i }));

    const nameField = getByRole('textbox', { name: 'project-card-name' });
    const addressField = getByRole('textbox', { name: 'project-card-address' });

    await user.clear(nameField);
    await user.type(nameField, 'new name');

    await user.clear(addressField);
    await user.type(addressField, 'new address');

    await user.click(getByRole('button', { name: /edit-project-name/i }));

    await user.click(getByRole('button', { name: 'Tallenna otsikon tiedot' }));

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as IProjectCard;

    // Check axios values
    expect(formPatchRequest.name).toEqual(responseProjectCard.name);
    expect(formPatchRequest.address).toEqual(responseProjectCard.address);
    expect(formPatchRequest.favPersons).toStrictEqual(responseProjectCard.favPersons);

    // Check that the form values stay updated with the state
    expect(getByText(matchExact(responseProjectCard.name))).toBeInTheDocument();
    expect(getByText(matchExact(responseProjectCard.address || ''))).toBeInTheDocument();
    expect(getByText(/removeFavourite/i)).toBeInTheDocument();
  });
});
