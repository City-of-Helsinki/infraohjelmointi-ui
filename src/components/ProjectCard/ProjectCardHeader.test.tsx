import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardHeader from './ProjectCardHeader';
import axios from 'axios';
import { setupStore } from '@/store';
import mockProjectCard from '@/mocks/mockProjectCard';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { debug } from 'console';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

// FIXME: the redux store doesn't update to the component even though if the store is present
// when we debug it anywhere, can't test component specific vars because of this
describe('ProjectCardHeader', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCard);
    await store.dispatch(getProjectCardThunk(mockProjectCard.data.id));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders component wrapper', () => {
    const { container } = renderWithProviders(<ProjectCardHeader />);

    expect(container.getElementsByClassName('project-card-header-container').length).toBe(1);
    expect(container.getElementsByClassName('header-row').length).toBe(1);
    expect(container.getElementsByClassName('header-row')[0].childElementCount).toBe(2);
  });

  it('render 2 columns for content', () => {
    const { container } = renderWithProviders(<ProjectCardHeader />);

    expect(container.getElementsByClassName('header-column').length).toBe(2);
  });

  it('renders all left side elements', async () => {
    const { container, user } = renderWithProviders(<ProjectCardHeader />);
    const mockAddress = 'Hämeentie 1, 00530 Helsinki';
    const projectCard = store.getState().projectCard.selectedProjectCard;

    // expect(screen.getByText(new RegExp(projectCard?.name || '', 'i'))).toBeInTheDocument();
    expect(container.getElementsByClassName('progress-indicator-container').length).toBe(1);
    expect(screen.getByText(new RegExp(mockAddress, 'i'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit-project-name/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /edit-project-name/i }));

    expect(store.getState().projectCard.selectedProjectCard).toBeDefined();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // expect(screen.getByText(new RegExp(`${projectCard?.projectReadiness}%`, 'i'))).toBeInTheDocument();
    // expect(screen.getByText(new RegExp(projectCard?.phase || '', "i"))).toBeInTheDocument();
  });

  it('renders all right side elements', async () => {
    const { container } = renderWithProviders(<ProjectCardHeader />);
    const mockGroup = 'Hakaniemi';

    expect(container.getElementsByClassName('favourite-button')[0]);

    expect(screen.getByRole('button', { name: /addFavourite/i })).toBeInTheDocument();
    expect(screen.getByText(/inGroup/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockGroup, 'i'))).toBeInTheDocument();
  });

  it('can add and remove favourites', async () => {
    const { user } = renderWithProviders(<ProjectCardHeader />);

    expect(screen.getByRole('button', { name: /addFavourite/i })).toBeInTheDocument();
    await user.click(screen.getByText(/addFavourite/i));
    expect(screen.getByRole('button', { name: /removeFavourite/i })).toBeInTheDocument();
  });
});
