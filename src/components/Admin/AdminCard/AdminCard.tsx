import { FC, memo, useCallback, useMemo } from 'react';
import { AdminFunctionType } from '@/interfaces/adminInterfaces';
import { useTranslation } from 'react-i18next';
import { Button, ButtonPresetTheme, ButtonVariant, Card } from 'hds-react';
import { useNavigate } from 'react-router';
import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import { isUserAdmin } from '@/utils/userRoleHelpers';
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
  const user = useAppSelector(selectUser);

  const navigateToAdminFunction = useCallback(() => {
    navigate(`/admin/${type.toLocaleLowerCase()}`);
  }, [navigate, type]);

  // Remove these disabled buttons as we implement more admin functionalities
  const buttonDisabled = useMemo(() => {
    if (!user || !isUserAdmin(user)) {
      return true;
    }
    return type === 'auditlog' || type === 'financialstatements' || type === 'menus';
  }, [type, user]);

  return (
    <div className="admin-card-container">
      <Card
        heading={t(`adminFunctions.${type}.name`) ?? ''}
        theme={adminCardTheme}
        text={t(`adminFunctions.${type}.description`) ?? ''}
        data-testid={`admin-card-${type}`}
      >
        <Button
          variant={ButtonVariant.Secondary}
          theme={ButtonPresetTheme.Black}
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
