import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithRouter, renderWithProviders } from './utils/testUtils';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

jest.mock('react-i18next', () => mockI18next());

describe('App', () => {
  // let appComponent: any;
  // beforeEach(() => {
  //   appComponent = renderWithProviders(<App />);
  // });

  it('renders the TopBar', () => {
    const app = <App />;
    renderWithProviders(app);
    renderWithRouter(app);
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
  });

  // it('renders the SideBar', () => {
  //   renderWithRouter(<App />);
  //   const { container } = renderWithProviders(<App />);
  //   const sideBar = container.getElementsByClassName('sidebar-container');

  //   expect(sideBar.length).toBe(1);
  // });

  // it('renders all app content', () => {
  //   renderWithRouter(<App />);
  //   const { container } = renderWithProviders(<App />);
  //   const appContet = container.getElementsByClassName('app-content');

  //   expect(appContet.length).toBe(1);
  //   expect(screen.getByTestId('app-outlet')).toBeInTheDocument();
  // });

  // test('landing on a bad page', () => {
  //   renderWithRouter(<App />, { route: '/something-that-does-not-match' });

  //   expect(screen.getByText(/no match/i)).toBeInTheDocument();
  // });
});
