import { Paragraph } from '@/components/shared';
import { Button } from 'hds-react/components/Button';
import { IconArrowLeft } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import './styles.css';

const ErrorView = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="error-page-container">
      <div className="error-column">
        <h1 className="text-heading-xl">{t('error.404')}</h1>
        <div className="error-spacer">
          <Paragraph size="xl" text="error.pageNotFound" />
        </div>
        <Button
          iconLeft={<IconArrowLeft />}
          size="small"
          onClick={() => navigate(-1)}
          data-testid="return-to-previous-btn"
        >
          {t('error.returnToPrevious')}
        </Button>
      </div>
    </div>
  );
};

export default ErrorView;
