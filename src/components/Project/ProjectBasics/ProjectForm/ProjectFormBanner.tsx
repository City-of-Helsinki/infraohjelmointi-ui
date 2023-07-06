import { Button } from 'hds-react';
import { BaseSyntheticEvent, FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
interface IProjectFormbannerProps {
  onSubmit: () =>
    | ((e?: BaseSyntheticEvent<object, unknown, unknown> | undefined) => Promise<void>)
    | undefined;
  isDirty: boolean;
}
const ProjectFormBanner: FC<IProjectFormbannerProps> = ({ onSubmit, isDirty }) => {
  const { t } = useTranslation();

  return (
    <div className="project-form-banner">
      <div className="project-form-banner-container">
        <Button onClick={onSubmit()} disabled={!isDirty} data-testid="submit-project-button">
          {t('saveChanges')}
        </Button>
      </div>
    </div>
  );
};

export default memo(ProjectFormBanner);
