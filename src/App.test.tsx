import mockI18next from '@/mocks/mockI18next';
import { screen, waitFor } from '@testing-library/react';
import App from './App';
import { INavigationItem } from './interfaces/common';
import { renderWithProviders } from './utils/testUtils';

jest.mock('react-i18next', () => mockI18next());

const navItems: Array<INavigationItem> = [
  {
    route: 'project-card',
    label: 'projectCard',
  },
];

describe('App', () => {
  it('renders the TopBar', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
  });

  it('renders the SideBar', () => {
    const { container } = renderWithProviders(<App />);
    expect(container.getElementsByClassName('sidebar-container').length).toBe(1);
  });

  it('renders all app content', () => {
    const { container } = renderWithProviders(<App />);
    expect(container.getElementsByClassName('app-content').length).toBe(1);
    expect(screen.getByTestId('app-outlet')).toBeInTheDocument();
  });

  /**
   * FIXME: get route tests to work, everything should be setup according to
   * https://testing-library.com/docs/example-react-router/
   */
  test.skip('landing on a bad page', async () => {
    renderWithProviders(<App />, { route: '/something-that-does-not-match' });
    await waitFor(() => {
      expect(screen.getByText(/error.404/i)).toBeInTheDocument();
    });
  });
});
