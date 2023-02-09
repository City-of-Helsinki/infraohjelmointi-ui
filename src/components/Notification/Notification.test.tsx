import mockI18next from '@/mocks/mockI18next';
import Notification from './Notification';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';
import { clearNotification, notifyInfo } from '@/reducers/notificationSlice';
import mockNotification from '@/mocks/mockNotification';
import { matchExact } from '@/utils/common';
import mockPersons from '@/mocks/mockPersons';
import { act } from 'react-dom/test-utils';
import { waitFor } from '@testing-library/react';
import { INotification } from '@/interfaces/common';
import { debug } from 'console';

jest.mock('react-i18next', () => mockI18next());

describe('Notification', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    await act(
      async () =>
        (renderResult = renderWithProviders(<Notification />, {
          preloadedState: {
            auth: { user: mockPersons.data[0], error: {} },
          },
        })),
    );
  });

  it('does not render the parent container if no notification is given', async () => {
    const { container } = renderResult;
    expect(container.getElementsByClassName('notifications-container').length).toBe(0);
  });

  it('renders a notification if dispatched', async () => {
    const { container, getByText, getByRole, store } = renderResult;

    await waitFor(() => store.dispatch(notifyInfo(mockNotification)));

    expect(container.getElementsByClassName('notifications-container').length).toBe(1);
    expect(getByRole('button', { name: matchExact('closeNotification') })).toBeInTheDocument();

    Object.values(mockNotification).forEach((n) => {
      if (n !== 'notification') {
        expect(getByText(matchExact(n))).toBeInTheDocument();
      }
    });
  });

  it.skip('is destroyed if notification is cleared', async () => {
    const { queryAllByText, getByText, store } = renderResult;

    await waitFor(() => store.dispatch(notifyInfo(mockNotification)));

    expect(getByText('sendSuccess')).toBeInTheDocument();
    expect(getByText('formSaveSuccess')).toBeInTheDocument();

    // FIXME: we should test by clicking the button, but that doesn't dispatch the action
    // => await user.click(getByRole('button', { name: matchExact('Close toast') }));
    await waitFor(() => store.dispatch(clearNotification(0)));

    Object.values(mockNotification).forEach((n) => {
      if (n !== 'notification') {
        expect(queryAllByText(matchExact(n))).toBeNull();
      }
    });

    expect(store.getState().notifications).toBeNull();
  });
});
