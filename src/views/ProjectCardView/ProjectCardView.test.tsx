import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProjectCard from '@/mocks/mockProjectCard';
import ProjectCardView from './ProjectCardView';
import { getProjectCardsThunk } from '@/reducers/projectCardSlice';
import { renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';
import { screen } from '@testing-library/react';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectCardView', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCard);
    await store.dispatch(getProjectCardsThunk());
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the parent container', async () => {
    const { container } = renderWithProviders(<ProjectCardView />);
    expect(container.getElementsByClassName('project-card-container').length).toBe(1);
  });

  it('renders the ProjectCardToolbar', async () => {
    const { container } = renderWithProviders(<ProjectCardView />);
    expect(container.getElementsByClassName('project-card-toolbar-container').length).toBe(1);
  });

  it('renders the ProjectCardHeader', async () => {
    const { container } = renderWithProviders(<ProjectCardView />);
    expect(container.getElementsByClassName('project-card-header-container').length).toBe(1);
  });

  it('renders the ProjectCardTabs', async () => {
    renderWithProviders(<ProjectCardView />);
    expect(screen.getByTestId('project-card-tabs-container')).toBeInTheDocument();
  });

  it('adds a project card to store if found', async () => {
    const projectCardState = store.getState().projectCard;
    const projectCard = store.getState().projectCard.selectedProjectCard;

    expect(projectCardState).toBeDefined();
    expect(projectCard).not.toBeNull();
    expect(projectCard).toEqual(mockProjectCard.data);
  });
});
