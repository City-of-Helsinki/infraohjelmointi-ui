import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProjectCard from '@/mocks/mockProjectCard';
import ProjectCardView from './ProjectCardView';
import { getProjectCardThunk } from '@/reducers/projectCardSlice';
import { renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';
import { mockProjectAreas, mockProjectPhases, mockProjectTypes } from '@/mocks/mockLists';
import {
  getProjectAreasThunk,
  getProjectPhasesThunk,
  getProjectTypesThunk,
} from '@/reducers/listsSlice';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe.skip('ProjectCardView', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCard);
    await store.dispatch(getProjectCardThunk(mockProjectCard.data.id));

    mockedAxios.get.mockResolvedValue(mockProjectTypes);
    await store.dispatch(getProjectTypesThunk());

    mockedAxios.get.mockResolvedValue(mockProjectAreas);
    await store.dispatch(getProjectAreasThunk());

    mockedAxios.get.mockResolvedValue(mockProjectPhases);
    await store.dispatch(getProjectPhasesThunk());
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('adds all needed data to store', async () => {
    expect(store.getState().projectCard.selectedProjectCard).toBeDefined();
    expect(store.getState().lists.area.length).toBeGreaterThan(0);
    expect(store.getState().lists.type.length).toBeGreaterThan(0);
    expect(store.getState().lists.phase.length).toBeGreaterThan(0);
  });

  it('renders the parent container', () => {
    const { container } = renderWithProviders(<ProjectCardView />, { store });
    expect(container.getElementsByClassName('project-card-container').length).toBe(1);
  });

  it('renders the ProjectCardToolbar', () => {
    const { container } = renderWithProviders(<ProjectCardView />, { store });
    expect(container.getElementsByClassName('project-card-toolbar-container').length).toBe(1);
  });

  it('renders the ProjectCardHeader', () => {
    const { container } = renderWithProviders(<ProjectCardView />, { store });
    expect(container.getElementsByClassName('project-card-header-container').length).toBe(1);
  });

  it('renders the ProjectCardTabs', async () => {
    const { findByTestId } = renderWithProviders(<ProjectCardView />, { store });
    expect(await findByTestId('tabs-list')).toBeInTheDocument();
  });
});
