import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { Notification as HDSNotification } from 'hds-react/components/Notification';
import { RootState } from '@/store';
import { FC } from 'react';
import { clearNotification } from '@/reducers/notificationSlice';
import { useTranslation } from 'react-i18next';
import './styles.css';

const Notification: FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state: RootState) => state.notifications);
  const { t } = useTranslation();

  return (
    <>
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map((n) => (
            <div key={n.id} className="notification-wrapper">
              <HDSNotification
                label={t(`notification.title.${n.title}`)}
                type={n.color}
                dismissible
                position={n.type === 'toast' ? 'top-right' : 'inline'}
                autoClose={n.type === 'toast'}
                autoCloseDuration={2500}
                closeButtonLabelText={t('closeNotification') || ''}
                onClose={() => dispatch(clearNotification(n.id || 0))}
              >
                {t(`notification.message.${n.message}`)}
              </HDSNotification>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Notification;
