import mockI18next from '@/mocks/mockI18next';
import { act } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectToolbar from './ProjectToolbar';
import mockPersons from '@/mocks/mockPersons';
import { Route } from 'react-router';

jest.mock('react-i18next', () => mockI18next());

const render = async () =>
  await act(async () =>
    renderWithProviders(<Route path="/" element={<ProjectToolbar />} />, {
      preloadedState: {
        auth: { user: mockPersons.data[0], error: {}, token: null },
      },
    }),
  );

describe('ProjectToolbar', () => {
  it('renders all items', async () => {
    const { getByTestId, getByRole } = await render();

    expect(getByTestId('toolbar')).toBeInTheDocument();
    expect(getByTestId('toolbar-left')).toBeInTheDocument();
    expect(getByTestId('toolbar-right')).toBeInTheDocument();
    expect(getByTestId('toolbar-left').childElementCount).toBe(2);
    expect(getByRole('button', { name: /new/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /shareProject/i })).toBeInTheDocument();
  });
});
