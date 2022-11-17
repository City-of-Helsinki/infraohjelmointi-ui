import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
// import { renderWithBrowserRouter, renderWithProviders } from './utils/testUtils';
import App from './App';
import { renderWithProviders } from './utils/testUtils';

jest.mock('react-i18next', () => mockI18next());

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
});
