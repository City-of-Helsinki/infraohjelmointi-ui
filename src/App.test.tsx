import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './utils/testUtils';
import App from './App';
import { setupStore } from './store';
import mockProjectCards from './mocks/mockProjectCards';
import { getProjectCardsThunk } from './reducers/projectCardSlice';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe.skip('App', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProjectCards);
    await store.dispatch(getProjectCardsThunk());
  });

  it('renders TopBar', () => {
    renderWithProviders(<App />, { store });
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
  });

  it('renders SideBar', async () => {
    const { container } = renderWithProviders(<App />, { store });
    expect(container.getElementsByClassName('sidebar-container').length).toBe(1);
  });

  it('renders app-content', () => {
    const { container } = renderWithProviders(<App />, { store });
    expect(container.getElementsByClassName('app-content').length).toBe(1);
    expect(screen.getByTestId('app-outlet')).toBeInTheDocument();
  });

  it('does not render Loader', () => {
    const { container } = renderWithProviders(<App />, { store });
    expect(container.getElementsByClassName('loader-overlay').length).toBe(0);
  });

  it('does not render Notification', () => {
    const { container } = renderWithProviders(<App />, { store });
    expect(container.getElementsByClassName('notifications-container').length).toBe(0);
  });

  /**
   * FIXME: get route tests to work, everything should be setup according to
   * https://testing-library.com/docs/example-react-router/
   */
  test.skip('landing on a bad page', async () => {
    const route = '/something-that-does-not-match';
    const { getByText } = renderWithProviders(<App />, {}, { route });
    await waitFor(() => {
      expect(getByText(/error.404/i)).toBeInTheDocument();
    });
  });
});
