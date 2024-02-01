import mockI18next from '@/mocks/mockI18next';
import Notification from './Notification';
import { renderWithProviders } from '@/utils/testUtils';
import { clearNotification, notifyInfo } from '@/reducers/notificationSlice';
import mockNotification from '@/mocks/mockNotification';
import { matchExact } from '@/utils/common';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';
import { Route } from 'react-router';
import { mockUser } from '@/mocks/mockUsers';
import preview from 'jest-preview';
jest.mock('react-i18next', () => mockI18next());

const render = async () =>
  await act(async () =>
    renderWithProviders(<Route path="/" element={<Notification />} />, {
      preloadedState: {
        auth: { user: mockUser.data, error: {} },
      },
    }),
  );

describe('Notification', () => {
  it('does not render the parent container if no notification is given', async () => {
    const { queryByTestId } = await render();

    expect(queryByTestId('notifications-container')).toBeNull();
  });

  it('renders a notification if dispatched', async () => {
    const { getByTestId, getByText, getByRole, store } = await render();

    await waitFor(() => store.dispatch(notifyInfo(mockNotification)));
    preview.debug();
    expect(getByTestId('notifications-container')).toBeInTheDocument();
    expect(getByRole('button', { name: matchExact('closeNotification') })).toBeInTheDocument();

    Object.values(mockNotification).forEach((n) => {
      if (n !== 'notification') {
        expect(getByText(matchExact(n))).toBeInTheDocument();
      }
    });
  });

  it('is destroyed if notification is cleared', async () => {
    const { queryByText, getByText, store } = await render();

    await waitFor(() => store.dispatch(notifyInfo(mockNotification)));

    expect(store.getState().notifications.length).toBe(1);

    expect(getByText('notification.title.sendSuccess')).toBeInTheDocument();
    expect(getByText('notification.message.formSaveSuccess')).toBeInTheDocument();

    await waitFor(() => store.dispatch(clearNotification(0)));

    expect(queryByText('notification.title.sendSuccess')).toBeNull();
    expect(queryByText('notification.message.formSaveSuccess')).toBeNull();

    expect(store.getState().notifications.length).toBe(0);
  });
});
