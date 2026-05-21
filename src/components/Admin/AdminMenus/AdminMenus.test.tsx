import mockI18next from '@/mocks/mockI18next';
import { renderWithProviders } from '@/utils/testUtils';
import AdminMenus from './AdminMenus';
import { setupStore, RootState } from '@/store';
import { act } from 'react-dom/test-utils';
import { Route } from 'react-router';
import { screen, waitFor } from '@testing-library/react';
import { useOptions } from '@/hooks/useOptions';
import * as listServices from '@/services/listServices';

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/services/listServices', () => {
  const actual = jest.requireActual('@/services/listServices');

  return {
    ...actual,
    postMenuListItem: jest.fn(),
  };
});

const ResponsiblePersonOptionsConsumer = () => {
  const options = useOptions('responsiblePersons');

  return (
    <ul data-testid="responsible-person-options">
      {options.map((option) => (
        <li key={option.value}>{option.label}</li>
      ))}
    </ul>
  );
};

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
    expect(screen.getByTestId('add-menu-item-input-value')).toBeInTheDocument();
  });

  it('opens edit dialog when clicking edit icon', async () => {
    const { user } = await render();

    const editButton = screen.getByTestId('admin-menus-edit-button-id-1');
    expect(editButton).toBeInTheDocument();
    await user.click(editButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('adminFunctions.menus.editItemDialogHeader')).toBeInTheDocument();
    expect(screen.getByTestId('edit-menu-item-input-value')).toBeInTheDocument();
    expect(screen.getByTestId('edit-menu-item-input-value')).toHaveValue('option.K1');
  });

  it('updates responsible person options immediately after adding a responsible person via admin menu', async () => {
    const postMenuListItemMock = listServices.postMenuListItem as jest.Mock;
    postMenuListItemMock.mockResolvedValueOnce({
      id: '11',
      firstName: 'Matti',
      lastName: 'Metsanen',
      email: 'matti.metsanen@example.com',
      title: 'Engineer',
      phone: '0501234567',
    });

    const { user } = await act(async () =>
      renderWithProviders(
        <Route
          path="/"
          element={
            <>
              <AdminMenus />
              <ResponsiblePersonOptionsConsumer />
            </>
          }
        />,
        {
          preloadedState: {
            lists: {
              ...baseStore.getState().lists,
              ...mockListsState,
              responsiblePersonsRaw: [
                {
                  id: '10',
                  firstName: 'Aino',
                  lastName: 'Aalto',
                  email: 'aino.aalto@example.com',
                  title: 'Planner',
                  phone: '0401234567',
                },
              ],
              responsiblePersons: [{ id: '10', value: 'Aalto Aino' }],
            },
          },
        },
      ),
    );

    expect(screen.getByTestId('responsible-person-options')).toHaveTextContent('Aalto Aino');
    expect(screen.getByTestId('responsible-person-options')).not.toHaveTextContent(
      'Metsanen Matti',
    );

    await user.click(screen.getByTestId('admin-menus-card-add-row-button-responsiblePersonsRaw'));

    await user.type(screen.getByTestId('add-menu-item-input-first-name'), 'Matti');
    await user.type(screen.getByTestId('add-menu-item-input-last-name'), 'Metsanen');
    await user.type(screen.getByTestId('add-menu-item-input-title'), 'Engineer');
    await user.type(screen.getByTestId('add-menu-item-input-email'), 'matti.metsanen@example.com');
    await user.type(screen.getByTestId('add-menu-item-input-phone-number'), '0501234567');

    await user.click(screen.getByTestId('submit-person-type-menu-item-button'));

    await waitFor(() => {
      expect(screen.getByTestId('responsible-person-options')).toHaveTextContent('Metsanen Matti');
    });
    expect(postMenuListItemMock).toHaveBeenCalledWith(
      {
        firstName: 'Matti',
        lastName: 'Metsanen',
        email: 'matti.metsanen@example.com',
        phone: '0501234567',
        title: 'Engineer',
      },
      'persons',
    );
  });
});
