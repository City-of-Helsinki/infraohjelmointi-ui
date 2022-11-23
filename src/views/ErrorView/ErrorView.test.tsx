import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import ErrorView from './ErrorView';

jest.mock('react-i18next', () => mockI18next());

describe('ErrorView', () => {
  it('renders the title and paragraph', () => {
    renderWithProviders(<ErrorView />);
    expect(screen.getByText(/error.404/i)).toBeInTheDocument();
    expect(screen.getByText(/error.pageNotFound/i)).toBeInTheDocument();
  });

  // FIXME: can't get this because it's a HDS-component
  it.skip('renders a return to previous page button', () => {
    renderWithProviders(<ErrorView />);
    expect(screen.getByText(/error.returnToPrevious/i)).toBeInTheDocument();
  });
});
