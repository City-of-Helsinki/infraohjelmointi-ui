import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import AdminMenus from './AdminMenus';
import { setupStore, RootState } from '@/store';
import { act } from 'react-dom/test-utils';
import { Route } from 'react-router';
import { screen } from '@testing-library/react';

jest.mock('react-i18next', () => mockI18next());

describe('AdminMenus', () => {
  const baseStore = setupStore();

  const mockListsState: Partial<RootState['lists']> = {
    categories: [
      { id: '1', value: 'K1', order: 1 },
      { id: '2', value: 'K2', order: 2 },
    ],
  };

  const render = async () =>
    await act(async () =>
      renderWithProviders(<Route path="/" element={<AdminMenus />} />, {
        preloadedState: {
          lists: {
            ...baseStore.getState().lists,
            ...mockListsState,
          },
        },
      }),
    );

  beforeAll(() => {
    class MockIntersectionObserver implements Partial<IntersectionObserver> {
      observe = jest.fn();
      disconnect = jest.fn();
    }

    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver as unknown as typeof IntersectionObserver,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders side navigation and cards', async () => {
    await render();

    expect(screen.getByTestId('admin-menus-card-categories')).toBeInTheDocument();
    expect(screen.getByTestId('admin-menus-side-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('value-0')).toBeInTheDocument();
    expect(screen.getByTestId('value-0')).toHaveTextContent('K1');
    expect(screen.getByTestId('value-1')).toBeInTheDocument();
    expect(screen.getByTestId('value-1')).toHaveTextContent('K2');
  });

  it('opens add dialog when clicking add button', async () => {
    const { user } = await render();

    const addRowButton = screen.getByTestId('admin-menus-card-add-row-button-categories');
    expect(addRowButton).toBeInTheDocument();
    await user.click(addRowButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('adminFunctions.menus.addItemDialogHeader')).toBeInTheDocument();
    expect(screen.getByTestId('add-menu-item-input')).toBeInTheDocument();
  });

  it('opens edit dialog when clicking edit icon', async () => {
    const { user } = await render();

    const editButton = screen.getByTestId('admin-menus-edit-button-id-1');
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('adminFunctions.menus.editItemDialogHeader')).toBeInTheDocument();
    expect(screen.getByTestId('edit-menu-item-input')).toBeInTheDocument();
    expect(screen.getByTestId('edit-menu-item-input')).toHaveValue('option.K1');
  });
});
