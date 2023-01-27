import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import TopBar from './TopBar';
import { renderWithProviders } from '@/utils/testUtils';
import { matchExact } from '@/utils/common';
import { setupStore } from '@/store';
import { getUserThunk } from '@/reducers/authSlice';
import mockUser from '@/mocks/mockUser';
import mockUsers from '@/mocks/mockUsers';

jest.mock('react-i18next', () => mockI18next());
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
describe('TopBar', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockUsers);
    store.dispatch(getUserThunk());
  });

  it('renders component wrapper', () => {
    const { getByTestId } = renderWithProviders(<TopBar />);

    expect(getByTestId('top-bar')).toBeInTheDocument();
  });

  it('renders all content', () => {
    const { getByTestId, getByRole, getAllByRole } = renderWithProviders(<TopBar />);

    expect(getByTestId('top-bar')).toBeInTheDocument();
    expect(getByRole('link', { name: matchExact('nav.skipToContent') })).toBeInTheDocument();
    expect(getByRole('button', { name: matchExact('menu') })).toBeInTheDocument();
    expect(getByRole('button', { name: matchExact('nav.search') })).toBeInTheDocument();
    expect(getAllByRole('button', { name: matchExact('nav.login') }).length).toBe(2);
    expect(getByRole('button', { name: matchExact('nav.notifications') })).toBeInTheDocument();
    expect(getByRole('search')).toBeInTheDocument();
    expect(getByRole('img')).toBeInTheDocument();
  });

  // FIXME: username doesn't update to nav for some reason
  it.skip('render username if user is found', () => {
    const { getByText } = renderWithProviders(<TopBar />, { store });

    expect(getByText(matchExact(`${mockUser.firstName} ${mockUser.lastName}`))).toBeInTheDocument();
  });
});
