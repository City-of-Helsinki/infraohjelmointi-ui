import { Button, ButtonVariant } from 'hds-react';
import { IconCross } from 'hds-react/icons';
import { FC, memo, useCallback } from 'react';
import { INewItemMenuDetails } from '@/interfaces/eventInterfaces';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/common';
import { selectSelections } from '@/reducers/planningSlice';
import useRestrictedClassAccess from '@/hooks/useRestrictedClassAccess';

interface INewItemMenuProps extends INewItemMenuDetails {
  onCloseMenu: () => void;
}

const NewItemMenu: FC<INewItemMenuProps> = ({
  onCloseMenu,
  onShowGroupDialog,
  onShowProjectProgrammedDialog,
  onOpenNewProjectForm,
}) => {
  const { t } = useTranslation();
  const selections = useAppSelector(selectSelections);
  // Restricted programmers can create projects but not summing groups (IO-756)
  const { isRestricted, canEditClass } = useRestrictedClassAccess();
  const selectedClassId = selections.selectedSubClass?.id ?? selections.selectedClass?.id;
  const onOpenProjectProgrammedDialog = useCallback(() => {
    onCloseMenu();
    onShowProjectProgrammedDialog();
  }, [onCloseMenu, onShowProjectProgrammedDialog]);

  const onOpenGroupDialog = useCallback(() => {
    onCloseMenu();
    onShowGroupDialog();
  }, [onCloseMenu, onShowGroupDialog]);

  const openNewProjectForm = useCallback(() => {
    onCloseMenu();
    onOpenNewProjectForm();
  }, [onCloseMenu, onOpenNewProjectForm]);
  return (
    <div className="project-cell-menu" data-testid="project-cell-menu">
      <div className="project-cell-menu-header">
        <div className="overflow-hidden">
          <p className="title" data-testid={'cell-title'}>
            Uusi
          </p>
        </div>
        <button className="close-icon" onClick={onCloseMenu} data-testid="close-project-cell-menu">
          <IconCross />
        </button>
      </div>
      <div className="project-cell-menu-footer">
        <Button
          variant={ButtonVariant.Supplementary}
          iconStart={undefined}
          onClick={onOpenProjectProgrammedDialog}
          disabled={!selectedClassId || !canEditClass(selectedClassId)}
          data-testid="open-project-programmed-dialog"
        >
          {t(`projectProgrammedForm.addProjectsToProgramming`)}
        </Button>
        {!isRestricted && (
          <Button
            variant={ButtonVariant.Supplementary}
            iconStart={undefined}
            onClick={onOpenGroupDialog}
            data-testid="open-summing-group-dialog"
          >
            {t(`createSummingGroups`)}
          </Button>
        )}
        <Button
          variant={ButtonVariant.Supplementary}
          iconStart={undefined}
          onClick={openNewProjectForm}
          data-testid="edit-year-button"
        >
          {t(`createNewProject`)}
        </Button>
      </div>
    </div>
  );
};

export default memo(NewItemMenu);
