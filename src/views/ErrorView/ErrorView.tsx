import { Paragraph, Title } from '@/components/shared';
import { Button } from 'hds-react/components/Button';
import { IconArrowLeft } from 'hds-react/icons';
import { t } from 'i18next';
import { useNavigate } from 'react-router';
import './styles.css';

const ErrorView = () => {
  const navigate = useNavigate();
  return (
    <div className="error-page-container">
      <div className="error-column">
        <div className="error-spacer">
          <Title size="xl" text="error.404" />
        </div>
        <div className="error-spacer">
          <Paragraph size="xl" text="error.pageNotFound" />
        </div>
        <Button iconLeft={<IconArrowLeft />} size="small" onClick={() => navigate(-1)}>
          {t('error.returnToPrevious')}
        </Button>
      </div>
    </div>
  );
};

export default ErrorView;
