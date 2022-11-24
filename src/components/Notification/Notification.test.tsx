import mockI18next from '@/mocks/mockI18next';
import Notification from './Notification';
import { renderWithProviders } from '@/utils/testUtils';
import { setupStore } from '@/store';
import { clearNotification, notifyInfo } from '@/reducers/notificationSlice';
import mockNotification from '@/mocks/mockNotification';
import { matchExact } from '@/utils/common';

jest.mock('react-i18next', () => mockI18next());

describe('Notification', () => {
  it('does not render the parent container if no notification is given', () => {
    const { container } = renderWithProviders(<Notification />);
    expect(container.getElementsByClassName('notifications-container').length).toBe(0);
  });

  it('renders a notification if dispatched', () => {
    const store = setupStore();
    store.dispatch(notifyInfo(mockNotification));
    const { container, getByText, getByRole } = renderWithProviders(<Notification />, { store });

    expect(container.getElementsByClassName('notifications-container').length).toBe(1);
    expect(getByRole('button', { name: matchExact('closeNotification') })).toBeInTheDocument();

    Object.values(mockNotification).forEach((v) => {
      expect(getByText(matchExact(v))).toBeInTheDocument();
    });
  });

  it.skip('is destroyed if notification is cleared', async () => {
    const store = setupStore();
    store.dispatch(notifyInfo(mockNotification));
    const { queryByText, getByText } = renderWithProviders(<Notification />, { store });

    Object.values(mockNotification).forEach((v) => {
      expect(getByText(matchExact(v))).toBeInTheDocument();
    });

    // FIXME: we should test by clicking the button, but that doesn't not dispatch the action
    // => await user.click(getByRole('button', { name: matchExact('Close toast') }));
    store.dispatch(clearNotification(0));

    Object.values(mockNotification).forEach((v) => {
      expect(queryByText(matchExact(v))).toBeNull();
    });

    expect(store.getState().notifications).toBeNull();
  });
});
