import { FC, memo, useCallback, useMemo } from 'react';
import { AdminFunctionType } from '@/interfaces/adminInterfaces';
import { useTranslation } from 'react-i18next';
import { Button, Card } from 'hds-react';
import { useNavigate } from 'react-router';
import './styles.css';

const adminCardTheme = {
  '--background-color': '#e8f3fc',
  '--padding-horizontal': 'var(--spacing-l)',
  '--padding-vertical': 'var(--spacing-m)',
};

interface IAdminCardProps {
  type: AdminFunctionType;
}

const AdminCard: FC<IAdminCardProps> = ({ type }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navigateToAdminFunction = useCallback(() => {
    navigate(`/admin/${type.toLocaleLowerCase()}`);
  }, [navigate, type]);

  // Remove these disabled buttons as we implement more admin functionalities
  const buttonDisabled = useMemo(
    () => type === 'auditlog' || type === 'financialstatements' || type === 'menus',
    [type],
  );

  return (
    <div className="admin-card-container">
      <Card
        heading={t(`adminFunctions.${type}.name`) ?? ''}
        theme={adminCardTheme}
        text={t(`adminFunctions.${type}.description`) ?? ''}
        data-testid={`admin-card-${type}`}
      >
        <Button
          variant="secondary"
          theme="black"
          role="link"
          onClick={navigateToAdminFunction}
          disabled={buttonDisabled}
          data-testid={`admin-card-button-${type}`}
        >
          {t(`adminFunctions.${type}.button`)}
        </Button>
      </Card>
    </div>
  );
};

export default memo(AdminCard);
