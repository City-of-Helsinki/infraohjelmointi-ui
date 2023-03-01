import { Button } from 'hds-react/components/Button';
import { IconArrowLeft } from 'hds-react/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

const ErrorView = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex justify-center h-screen">
      <div className="flex-col justify-center text-center">
        <h1 className="text-heading-xl">{t('error.404')}</h1>
        <div className="mb-4">
          <p className="text-xl">{t('error.pageNotFound')}</p>
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
