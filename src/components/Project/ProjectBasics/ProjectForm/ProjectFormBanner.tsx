import { Button } from 'hds-react';
import { BaseSyntheticEvent, FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
interface IProjectFormbannerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: () => (e?: BaseSyntheticEvent<object, any, any> | undefined) => Promise<void>;
  isDirty: boolean;
}
const ProjectFormBanner: FC<IProjectFormbannerProps> = ({ onSubmit, isDirty }) => {
  const { t } = useTranslation();

  return (
    <div className="project-form-banner">
      <div className="project-form-banner-container">
        <Button onClick={onSubmit()} disabled={!isDirty}>
          {t('saveChanges')}
        </Button>
      </div>
    </div>
  );
};

export default memo(ProjectFormBanner);
