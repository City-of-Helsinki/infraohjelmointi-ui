import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProjectCard from '@/mocks/mockProjectCard';
import ProjectCardView from './ProjectCardView';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe.skip('ProjectCardView', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCard);
    await store.dispatch(getProjectCardThunk(mockProjectCard.data.id));
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('adds a project card to store', async () => {
    expect(store.getState().projectCard.selectedProjectCard).toBeDefined();
    expect(store.getState().projectCard.selectedProjectCard).not.toBeNull();
  });

  it('renders the parent container', async () => {
    const { container } = renderWithProviders(<ProjectCardView />, { store });
    expect(container.getElementsByClassName('project-card-container').length).toBe(1);
  });

  it('renders the ProjectCardToolbar', async () => {
    const { container } = renderWithProviders(<ProjectCardView />, { store });
    expect(container.getElementsByClassName('project-card-toolbar-container').length).toBe(1);
  });

  it('renders the ProjectCardHeader', async () => {
    const { container } = renderWithProviders(<ProjectCardView />, { store });
    expect(container.getElementsByClassName('project-card-header-container').length).toBe(1);
  });

  it('renders the ProjectCardTabs', async () => {
    const { findByTestId } = renderWithProviders(<ProjectCardView />, { store });
    expect(await findByTestId('tabs-list')).toBeInTheDocument();
  });
});
