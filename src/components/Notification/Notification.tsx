import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { Notification as HDSNotification } from 'hds-react/components/Notification';
import { FC } from 'react';
import { clearNotification, selectNotification } from '@/reducers/notificationSlice';
import { useTranslation } from 'react-i18next';
import './styles.css';

const Notification: FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotification);
  const { t } = useTranslation();
  console.log(notifications);

  return (
    <>
      {notifications.length > 0 && (
        <div className="notification-container" data-testid="notifications-container">
          {notifications.map((n) => (
            <div key={n.id} className="notification-wrapper">
              <HDSNotification
                label={n.title ? t(`notification.title.${n.title}`) : t(`notification.title.${n.status}`)}
                type={n.color}
                dismissible
                position={n.type === 'toast' ? 'top-right' : 'inline'}
                autoClose={n.type === 'toast'}
                autoCloseDuration={n.duration}
                closeButtonLabelText={t('closeNotification') ?? ''}
                onClose={() => dispatch(clearNotification(n.id ?? 0))}
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
