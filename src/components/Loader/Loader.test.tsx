import mockI18next from '@/mocks/mockI18next';
import { clearLoading, setLoading } from '@/reducers/loadingSlice';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import { waitFor } from '@testing-library/react';
import Loader from './Loader';

jest.mock('react-i18next', () => mockI18next());

describe.skip('Loader', () => {
  it('does not render Loader if isLoading is false', () => {
    const { container } = renderWithProviders(<Loader />);
    expect(container.getElementsByClassName('loader-container').length).toBe(0);
  });

  it('renders Loader when isLoading is true', () => {
    const store = setupStore();
    store.dispatch(setLoading('Testing loader'));
    const { container, getByText } = renderWithProviders(<Loader />, { store });

    expect(getByText(/Testing loader/i)).toBeInTheDocument();
    expect(container.getElementsByClassName('loader-overlay').length).toBe(1);
    expect(container.getElementsByClassName('loader-container').length).toBe(1);
  });

  it('hides Loader when isLoading is becomes false', async () => {
    const store = setupStore();
    store.dispatch(setLoading('Testing loader'));
    const { getByText, queryByText } = renderWithProviders(<Loader />, { store });

    expect(getByText(/Testing loader/i)).toBeInTheDocument();

    await waitFor(() => {
      store.dispatch(clearLoading());
    });

    expect(queryByText(/Testing loader/i)).toBeNull();
  });
});
