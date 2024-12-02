import { Button, ButtonSize } from 'hds-react/components/Button';
import { IconArrowLeft } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import './styles.css';

const ErrorView = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="error-view">
      <div className="error-view-container">
        <h1 className="text-heading-xl">{t('error.404')}</h1>
        <div className="mb-4">
          <p className="text-xl">{t('error.pageNotFound')}</p>
        </div>
        <Button
          iconStart={<IconArrowLeft />}
          size={ButtonSize.Small}
          onClick={() => navigate('/planning')}
          data-testid="return-to-frontpage-btn"
        >
          {t('error.returnToFrontPage')}
        </Button>
      </div>
    </div>
  );
};

export default ErrorView;
