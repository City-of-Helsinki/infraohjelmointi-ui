import mockI18next from '@/mocks/mockI18next';
import Notification from './Notification';
import { renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';
import { setNotification } from '@/reducers/notificationSlice';
import mockNotification from '@/mocks/mockNotification';
import { screen } from '@testing-library/react';
import { debug } from 'console';

jest.mock('react-i18next', () => mockI18next());

describe('Notification', () => {
  it('renders the parent container', () => {
    const { container } = renderWithProviders(<Notification />);
    expect(container.getElementsByClassName('notifications-container').length).toBe(1);
  });

  // FIXME: how to wait for notifications to get the renedered one, since it should technical be here now?
  it.skip('renders a notification if dispatched', () => {
    const store = setupStore();
    renderWithProviders(<Notification />);

    store.dispatch(setNotification(mockNotification));
  });
});
