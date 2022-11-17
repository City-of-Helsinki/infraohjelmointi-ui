import mockI18next from '@/mocks/mockI18next';
import { screen } from '@testing-library/react';
import { renderWithRouter, renderWithProviders } from '../../utils/testUtils';
import ErrorView from './ErrorView';

jest.mock('react-i18next', () => mockI18next());

describe('ErrorView', () => {
  let errorComponent: any;

  beforeEach(() => {
    errorComponent = renderWithProviders(<ErrorView />);
    renderWithRouter(errorComponent);
  });

  it('renders the title and paragraph', () => {
    expect(screen.getByText(/error.404/i)).toBeInTheDocument();
    expect(screen.getByText(/error.pageNotFound/i)).toBeInTheDocument();
  });
  it('renders a return to previous page', () => {
    expect(screen.getByText(/error.returnToPrevious/i)).toBeInTheDocument();
  });
});
