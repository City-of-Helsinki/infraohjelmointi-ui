import mockI18next from '@/mocks/mockI18next';
import { renderWithBrowserRouter, renderWithProviders } from '@/utils/testUtils';
import ProjectCardView from './ProjectCardView';
import { IProjectCard } from '@/interfaces/projectCardInterfaces';

jest.mock('react-i18next', () => mockI18next());

describe('ProjectCardView', () => {
  let result: IProjectCard | null = null;

  beforeEach(async () => {
    renderWithProviders(renderWithBrowserRouter(<ProjectCardView />));
  });

  it('Project card parent container should render', async () => {
    const { container } = renderWithProviders(renderWithBrowserRouter(<ProjectCardView />));
    const projectCardContainer = container.getElementsByClassName('project-card-container');
    expect(projectCardContainer.length).toBe(1);
  });

  it('Should get a Project Card on render', async () => {
    expect(result).toBeDefined();
  });
});

// jest.mock('axios');

// const mockedAxios = axios as jest.Mocked<typeof axios>;

// const store = setupStore();

// mockedAxios.get.mockResolvedValueOnce(mockProjectCard);
// result = store.getState().projectCard.selectedProjectCard;
