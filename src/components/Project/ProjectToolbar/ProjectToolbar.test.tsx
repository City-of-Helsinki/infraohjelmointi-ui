import mockI18next from '@/mocks/mockI18next';
import { act } from '@testing-library/react';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import ProjectToolbar from './ProjectToolbar';
import mockPersons from '@/mocks/mockPersons';

jest.mock('react-i18next', () => mockI18next());

describe('ProjectToolbar', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<ProjectToolbar />, {
          preloadedState: {
            auth: { user: mockPersons.data[0], error: {} },
          },
        })),
    );
  });

  it('renders all items', () => {
    const { getByTestId, getByRole } = renderResult;
    expect(getByTestId('toolbar')).toBeInTheDocument();
    expect(getByTestId('toolbar-left')).toBeInTheDocument();
    expect(getByTestId('toolbar-right')).toBeInTheDocument();
    expect(getByTestId('toolbar-left').childElementCount).toBe(2);
    expect(getByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /shareProject/i })).toBeInTheDocument();
  });
});
