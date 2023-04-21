import mockI18next from '@/mocks/mockI18next';
import mockPersons from '@/mocks/mockPersons';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import { renderWithProviders } from '@/utils/testUtils';
import { act, waitFor } from '@testing-library/react';
import Loader from './Loader';
import { Route } from 'react-router';

jest.mock('react-i18next', () => mockI18next());

const render = async () =>
  await act(async () =>
    renderWithProviders(<Route path="/" element={<Loader />} />, {
      preloadedState: {
        auth: { user: mockPersons.data[0], error: {} },
      },
    }),
  );
describe('Loader', () => {
  it('does not render Loader if isLoading is false', async () => {
    const { queryByTestId } = await render();
    expect(queryByTestId('loader-wrapper')).toBeNull();
  });

  it('renders Loader when isLoading is true', async () => {
    const { store, getByTestId } = await render();

    await waitFor(() => store.dispatch(setLoading({ text: 'Testing loader', id: 'test-url' })));

    expect(getByTestId('loader-wrapper')).toBeInTheDocument();
    expect(getByTestId('loader')).toBeInTheDocument();
  });

  it('hides Loader when isLoading is becomes false', async () => {
    const { store, queryByText } = await render();

    await waitFor(() => store.dispatch(setLoading({ text: 'Testing loader', id: 'test-url' })));

    await waitFor(() => store.dispatch(clearLoading('test-url')));

    expect(queryByText(/Testing loader/i)).toBeNull();
  });
});
