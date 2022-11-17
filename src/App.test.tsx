import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithBrowserRouter, renderWithProviders } from './utils/testUtils';
import App from './App';

jest.mock('react-i18next', () => mockI18next());

describe('App', () => {
  let app: any;

  beforeEach(() => {
    app = renderWithProviders(renderWithBrowserRouter(<App />));
  });

  it('TopBar should render', () => {
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
  });

  it('SideBar should render', () => {
    const { container } = app;
    const sideBar = container.getElementsByClassName('sidebar-container');

    expect(sideBar.length).toBe(1);
  });

  it('App content container should render', () => {
    const { container } = app;
    const appContet = container.getElementsByClassName('app-content');

    expect(appContet.length).toBe(1);
    expect(screen.getByTestId('app-outlet')).toBeInTheDocument();
  });
});
