import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import mockUsers from '@/mocks/mockUsers';
import { getUsersThunk } from '@/reducers/authSlice';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectCardBasics from './ProjectCardBasics';

jest.mock('react-i18next', () => mockI18next());
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectCardBasics', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockUsers);
    await store.dispatch(getUsersThunk());
  });

  const navItems = [
    {
      route: 'basics',
      label: 'nav.basics',
    },
  ];

  it('renders all component wrappers', async () => {
    const { container } = renderWithProviders(<ProjectCardBasics />, { store });
    expect(container.getElementsByClassName('project-card-content-container').length).toBe(1);
    expect(container.getElementsByClassName('side-panel').length).toBe(1);
    expect(container.getElementsByClassName('form-panel').length).toBe(1);
  });

  it('renders SideNavigation and links', () => {
    const { container, getByRole } = renderWithProviders(<ProjectCardBasics />, { store });
    expect(container.getElementsByClassName('side-nav').length).toBe(1);

    navItems.forEach((n) => {
      expect(
        getByRole('link', {
          name: n.label,
        }),
      ).toBeInTheDocument();
    });
  });

  it('renders ProjectCardBasicsForm', () => {
    const { container } = renderWithProviders(<ProjectCardBasics />);
    expect(container.getElementsByClassName('basics-form').length).toBe(1);
  });
});
