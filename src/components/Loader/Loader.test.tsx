import mockI18next from '@/mocks/mockI18next';
import mockPersons from '@/mocks/mockPersons';
import { clearLoading, setLoading } from '@/reducers/loadingSlice';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { act, waitFor } from '@testing-library/react';
import Loader from './Loader';

jest.mock('react-i18next', () => mockI18next());

describe('Loader', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<Loader />, {
          preloadedState: {
            auth: { user: mockPersons.data[0], error: {} },
          },
        })),
    );
  });

  it('does not render Loader if isLoading is false', () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('loader-container').length).toBe(0);
  });

  it('renders Loader when isLoading is true', async () => {
    const { container, getByText, store } = renderResult;

    await waitFor(() => store.dispatch(setLoading('Testing loader')));

    expect(getByText(/Testing loader/i)).toBeInTheDocument();
    expect(container.getElementsByClassName('loader-overlay').length).toBe(1);
    expect(container.getElementsByClassName('loader-container').length).toBe(1);
  });

  it('hides Loader when isLoading is becomes false', async () => {
    const { store, getByText, queryByText } = renderResult;

    await waitFor(() => store.dispatch(setLoading('Testing loader')));

    expect(getByText(/Testing loader/i)).toBeInTheDocument();

    await waitFor(() => store.dispatch(clearLoading()));

    expect(queryByText(/Testing loader/i)).toBeNull();
  });
});
