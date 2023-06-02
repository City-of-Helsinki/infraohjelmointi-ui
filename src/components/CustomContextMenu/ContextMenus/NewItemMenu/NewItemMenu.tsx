import { Button } from 'hds-react/components/Button';
import { IconCross } from 'hds-react/icons';
import { FC, memo } from 'react';
import { INewItemMenuDetails } from '@/interfaces/eventInterfaces';
import { useTranslation } from 'react-i18next';

interface INewItemMenuProps extends INewItemMenuDetails {
  onCloseMenu: () => void;
}

const NewItemMenu: FC<INewItemMenuProps> = ({
  onCloseMenu,
  selections,
  onShowGroupDialog,
  onShowProjectProgrammedDialog,
}) => {
  // TODO: only use callback functions here, no logic :)
  const { t } = useTranslation();
  return (
    <div className="project-cell-menu" data-testid="project-cell-menu">
      <div className="project-cell-menu-header">
        <div className="overflow-hidden">
          <p className="title" data-testid={'cell-title'}>
            Uusi
          </p>
        </div>
        <IconCross
          className="close-icon"
          onClick={onCloseMenu}
          data-testid="close-project-cell-menu"
        />
      </div>
      <div className="project-cell-menu-footer">
        <Button
          variant="supplementary"
          iconLeft={undefined}
          onClick={() => {
            onCloseMenu();
            onShowProjectProgrammedDialog();
          }}
          disabled={selections.selectedClass?.id || selections.selectedSubClass?.id ? false : true}
          data-testid="open-project-programmed-dialog"
        >
          {t(`projectProgrammedForm.addProjectsToProgramming`)}
        </Button>
        <Button
          variant="supplementary"
          iconLeft={undefined}
          onClick={() => {
            onCloseMenu();
            onShowGroupDialog();
          }}
          data-testid="edit-year-button"
        >
          {t(`createSummingGroups`)}
        </Button>
        <Button
          variant="supplementary"
          iconLeft={undefined}
          disabled={true}
          //  TODO: onClick={handleEditTimeline}
          data-testid="edit-year-button"
        >
          Luo uusi hanke
        </Button>
      </div>
    </div>
  );
};

export default memo(NewItemMenu);
