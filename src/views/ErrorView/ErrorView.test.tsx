import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import mockUsers from '@/mocks/mockUsers';
import { getUsersThunk } from '@/reducers/authSlice';
import { setupStore } from '@/store';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import ErrorView from './ErrorView';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ErrorView', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockUsers);
    await store.dispatch(getUsersThunk());
  });

  it('renders the title and paragraph', () => {
    renderWithProviders(<ErrorView />, { store });
    expect(screen.getByText(/error.404/i)).toBeInTheDocument();
    expect(screen.getByText(/error.pageNotFound/i)).toBeInTheDocument();
  });

  // FIXME: can't get this because it's a HDS-component
  it.skip('renders a return to previous page button', () => {
    renderWithProviders(<ErrorView />, { store });
    expect(screen.getByText(/error.returnToPrevious/i)).toBeInTheDocument();
  });
});
