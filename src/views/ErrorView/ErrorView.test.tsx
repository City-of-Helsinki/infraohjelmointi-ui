import mockI18next from '@/mocks/mockI18next';
import mockPersons from '@/mocks/mockPersons';
import { act } from '@testing-library/react';
import { CustomRenderResult, renderWithProviders } from '../../utils/testUtils';
import ErrorView from './ErrorView';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

describe('ErrorView', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<ErrorView />, {
          preloadedState: {
            auth: { user: mockPersons.data[0], error: {} },
          },
        })),
    );
  });

  it('renders the title and paragraph', () => {
    const { getByText } = renderResult;
    expect(getByText(/error.404/i)).toBeInTheDocument();
    expect(getByText(/error.pageNotFound/i)).toBeInTheDocument();
  });

  it('renders a return to previous page button', () => {
    const { getByTestId } = renderResult;
    expect(getByTestId('return-to-previous-btn')).toBeInTheDocument();
  });
});
