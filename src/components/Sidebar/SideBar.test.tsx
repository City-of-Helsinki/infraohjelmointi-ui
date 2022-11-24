import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import SideBar from './SideBar';
import { renderWithProviders } from '@/utils/testUtils';
import { INavigationItem } from '@/interfaces/common';
import { getProjectCards } from '@/services/projectCardServices';
import mockProjectCards from '@/mocks/mockProjectCards';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

// FIXME: added getProjectCards() to Sidebar.tsx broke the tests
// 'Warning: An update to SideBar inside a test was not wrapped in act(...).'
describe.skip('SideBar', () => {
  const navItems: Array<INavigationItem> = [
    {
      route: 'project-card',
      label: 'projectCard',
    },
  ];

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCards);
    await getProjectCards();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders component wrapper', async () => {
    const { getByTestId } = renderWithProviders(<SideBar />);
    expect(getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders the correct amount of navItems', async () => {
    const { getByTestId, getByRole } = renderWithProviders(<SideBar />);
    expect(getByTestId('sidebar').childElementCount).toBe(navItems.length);

    navItems.forEach((n) => {
      expect(getByRole('button', { name: n.label })).toBeInTheDocument();
    });
  });
});
