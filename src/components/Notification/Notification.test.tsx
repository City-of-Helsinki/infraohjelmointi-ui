import mockI18next from '@/mocks/mockI18next';
import Notification from './Notification';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { clearNotification, notifyInfo } from '@/reducers/notificationSlice';
import mockNotification from '@/mocks/mockNotification';
import { matchExact } from '@/utils/common';
import mockPersons from '@/mocks/mockPersons';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';
import { Route } from 'react-router';
jest.mock('react-i18next', () => mockI18next());

describe('Notification', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<Route path="/" element={<Notification />} />, {
          preloadedState: {
            auth: { user: mockPersons.data[0], error: {} },
          },
        })),
    );
  });

  it('does not render the parent container if no notification is given', async () => {
    const { queryByTestId } = renderResult;
    expect(queryByTestId('notifications-container')).toBeNull();
  });

  it('renders a notification if dispatched', async () => {
    const { getByTestId, getByText, getByRole, store } = renderResult;

    await waitFor(() => store.dispatch(notifyInfo(mockNotification)));

    expect(getByTestId('notifications-container')).toBeInTheDocument();
    expect(getByRole('button', { name: matchExact('closeNotification') })).toBeInTheDocument();

    Object.values(mockNotification).forEach((n) => {
      if (n !== 'notification') {
        expect(getByText(matchExact(n))).toBeInTheDocument();
      }
    });
  });

  it('is destroyed if notification is cleared', async () => {
    const { queryByText, getByText, store } = renderResult;

    await waitFor(() => store.dispatch(notifyInfo(mockNotification)));

    expect(store.getState().notifications.length).toBe(1);

    expect(getByText('notification.title.sendSuccess')).toBeInTheDocument();
    expect(getByText('notification.message.formSaveSuccess')).toBeInTheDocument();

    // FIXME: we should test by clicking the button, but that doesn't dispatch the action
    // => await user.click(getByRole('button', { name: matchExact('Close toast') }));
    await waitFor(() => store.dispatch(clearNotification(0)));

    expect(queryByText('notification.title.sendSuccess')).toBeNull();
    expect(queryByText('notification.message.formSaveSuccess')).toBeNull();

    expect(store.getState().notifications.length).toBe(0);
  });
});
