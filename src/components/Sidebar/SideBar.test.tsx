import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import SideBar from './SideBar';
import { renderWithProviders } from '@/utils/testUtils';
import { INavigationItem } from '@/interfaces/common';
import mockProjectCards from '@/mocks/mockProjectCards';
import { setupStore } from '@/store';
import { getProjectCardsThunk } from '@/reducers/projectCardSlice';
import { matchExact } from '@/utils/common';

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
  ];

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCards);
    await store.dispatch(getProjectCardsThunk());
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

  it('populates projectCards to redux', async () => {
    renderWithProviders(<SideBar />, { store });
    expect(store.getState().projectCard.projectCards?.length).toBeGreaterThan(0);
  });

  // FIXME: tests with routes don't work yet
  it.skip('adds the correct projectId as the route to ProjectCardView', async () => {
    const { getByRole, user, getByText } = renderWithProviders(<SideBar />, { store });
    await user.click(getByRole('button', { name: matchExact(navItems[0].label) }));
    expect(getByText(matchExact('Hakaniementori'))).toBeInTheDocument();
  });
});
