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
    expect(getByText(matchExact('Hämeentie 1, 00530 Helsinki'))).toBeInTheDocument();
  });

  it('project name can be edited by clicking the edit button', async () => {
    const { getByRole, queryByRole } = renderWithProviders(<ProjectCardHeader />, { store });
    const user = userEvent.setup();

    // TODO: this needs to be tested better
    await user.click(getByRole('button', { name: /edit-project-name/i }));
    expect(getByRole('textbox')).toBeInTheDocument();
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
});