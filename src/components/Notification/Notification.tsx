import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { Notification as HDSNotification } from 'hds-react/components/Notification';
import { RootState } from '@/store';
import { FC } from 'react';
import { clearNotification } from '@/reducers/notificationSlice';

const Notification: FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state: RootState) => state.notifications);

  /**
   * Notifications are placed in a centered absolute container
   * in order to make multiple stack ontop of eachother
   */
  return (
    <div className="notifications-container">
      {notifications.length > 0 &&
        notifications.map((n) => (
          <div key={n.id} className="notification-wrapper">
            <HDSNotification
              label={n.title}
              type={n.type || undefined}
              dismissible
              position="inline"
              closeButtonLabelText="Close toast"
              onClose={() => dispatch(clearNotification(n.id || 0))}
            >
              {n.message}
            </HDSNotification>
          </div>
        ))}
    </div>
  );
};

export default Notification;
