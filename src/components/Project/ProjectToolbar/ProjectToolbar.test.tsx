import { act } from '@testing-library/react';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectToolbar from './ProjectToolbar';
import { Route } from 'react-router';
import { mockUser } from '@/mocks/mockUsers';

vi.mock('react-i18next', async () => (await import('@/mocks/mockI18next')).default());

const render = async () =>
  await act(async () =>
    renderWithProviders(<Route path="/" element={<ProjectToolbar />} />, {
      preloadedState: {
        auth: { user: mockUser.data, error: {} },
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
