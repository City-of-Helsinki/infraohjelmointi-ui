import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProjectCard from '@/mocks/mockProjectCard';
import ProjectCardView from './ProjectCardView';
import { getProjectCardsThunk } from '@/reducers/projectCardSlice';
import { renderWithBrowserRouter, renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';
import { screen } from '@testing-library/react';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectCardView', () => {
  const store = setupStore();

  let container: any = null;
  let projectCardComponent: any;

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCard);
    await store.dispatch(getProjectCardsThunk());
    projectCardComponent = renderWithProviders(renderWithBrowserRouter(<ProjectCardView />));
    container = projectCardComponent.container;
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the parent container', async () => {
    const projectCardContainer = container.getElementsByClassName('project-card-container');
    expect(projectCardContainer.length).toBe(1);
  });

  it('renders the ProjectCardToolbar', async () => {
    const toolbarContainer = container.getElementsByClassName('project-card-toolbar-container');
    expect(toolbarContainer.length).toBe(1);
  });

  it('renders the ProjectCardHeader', async () => {
    const headerContainer = container.getElementsByClassName('project-card-header-container');
    expect(headerContainer.length).toBe(1);
  });

  it('renders the ProjectCardTabs', async () => {
    expect(screen.getByTestId('project-card-tabs-container')).toBeInTheDocument();
  });

  it('adds a project card to store if found', async () => {
    const projectCardState = store.getState().projectCard;
    const projectCard = store.getState().projectCard.selectedProjectCard;

    expect(projectCardState).toBeDefined();
    expect(projectCard).not.toBeNull();
    expect(projectCard).toEqual(mockProjectCard.data[0]);
  });
});
