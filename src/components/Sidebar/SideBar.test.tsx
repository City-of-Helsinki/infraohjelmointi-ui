import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import SideBar from './SideBar';
import { renderWithProviders } from '@/utils/testUtils';
import { INavigationItem } from '@/interfaces/common';
import { setupStore } from '@/store';
import { matchExact } from '@/utils/common';
import mockUsers from '@/mocks/mockUsers';
import { getUsersThunk } from '@/reducers/authSlice';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SideBar', () => {
  const store = setupStore();

  const navItems: Array<INavigationItem> = [
    {
      route: 'project-card',
      label: 'projectCard',
    },
    {
      route: 'planning-list',
      label: 'planningList',
    },
  ];

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockUsers);
    await store.dispatch(getUsersThunk());
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders component wrapper', async () => {
    const { getByTestId } = renderWithProviders(<SideBar />, { store });
    expect(getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders the correct amount of navItems', async () => {
    const { getByTestId, getByRole } = renderWithProviders(<SideBar />, { store });
    expect(getByTestId('sidebar').childElementCount).toBe(navItems.length);

    navItems.forEach((n) => {
      expect(getByRole('button', { name: n.label })).toBeInTheDocument();
    });
  });

  // FIXME: tests with routes don't work yet
  it.skip('adds the correct projectId as the route to ProjectCardView', async () => {
    const { getByRole, user, getByText } = renderWithProviders(<SideBar />, { store });
    await user.click(getByRole('button', { name: matchExact(navItems[0].label) }));
    expect(getByText(matchExact('Hakaniementori'))).toBeInTheDocument();
  });
});
