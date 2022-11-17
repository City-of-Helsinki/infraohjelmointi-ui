import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithBrowserRouter, renderWithProviders } from './utils/testUtils';
import App from './App';

jest.mock('react-i18next', () => mockI18next());

describe('App', () => {
  let appComponent: any;

  beforeEach(() => {
    appComponent = renderWithProviders(renderWithBrowserRouter(<App />));
  });

  it('renders the TopBar', () => {
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
  });

  it('renders the SideBar', () => {
    const { container } = appComponent;
    const sideBar = container.getElementsByClassName('sidebar-container');

    expect(sideBar.length).toBe(1);
  });

  it('renders all app content', () => {
    const { container } = appComponent;
    const appContet = container.getElementsByClassName('app-content');

    expect(appContet.length).toBe(1);
    expect(screen.getByTestId('app-outlet')).toBeInTheDocument();
  });
});
