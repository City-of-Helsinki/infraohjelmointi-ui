import { useTranslation } from 'react-i18next';
import './styles.css';

const AccessDeniedView = () => {
  const { t } = useTranslation();

  return (
    <div className="access-denied-view">
      <div className="access-denied-view-container">
        <h1 className="text-heading-xl">{t('error.accessDenied')}</h1>
        <div className="mb-4">
          <p className="text-xl">{t('error.accessDeniedContactSupport')}</p>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedView;
