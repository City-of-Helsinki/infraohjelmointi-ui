import mockI18next from '@/mocks/mockI18next';
import mockPersons from '@/mocks/mockPersons';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { act, waitFor } from '@testing-library/react';
import Loader from './Loader';
import { Route } from 'react-router';

jest.mock('react-i18next', () => mockI18next());

describe('Loader', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<Route path="/" element={<Loader />} />, {
          preloadedState: {
            auth: { user: mockPersons.data[0], error: {} },
          },
        })),
    );
  });

  it('does not render Loader if isLoading is false', () => {
    const { queryByTestId } = renderResult;
    expect(queryByTestId('loader-wrapper')).toBeNull();
  });

  it('renders Loader when isLoading is true', async () => {
    const { store, getByTestId } = renderResult;

    await waitFor(() => store.dispatch(setLoading({ text: 'Testing loader', id: 'test-url' })));

    expect(getByTestId('loader-wrapper')).toBeInTheDocument();
    expect(getByTestId('loader')).toBeInTheDocument();
  });

  it('hides Loader when isLoading is becomes false', async () => {
    const { store, queryByText } = renderResult;

    await waitFor(() => store.dispatch(setLoading({ text: 'Testing loader', id: 'test-url' })));

    await waitFor(() => store.dispatch(clearLoading('test-url')));

    expect(queryByText(/Testing loader/i)).toBeNull();
  });
});
