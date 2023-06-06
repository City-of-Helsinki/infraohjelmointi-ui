import { Button } from 'hds-react/components/Button';
import { IconCross, IconCopy } from 'hds-react/icons';
import { FC, memo, useCallback } from 'react';
import { GroupRowMenuDetails } from '@/interfaces/eventInterfaces';
import { useTranslation } from 'react-i18next';

const GroupRowContextMenu: FC<GroupRowMenuDetails> = ({ groupName }) => {
  const { t } = useTranslation();

  return (
    <div className="project-cell-menu" data-testid="project-cell-menu">
      <div className="project-cell-menu-header">
        <div className="overflow-hidden">
          <p className="title" data-testid={'cell-title'}>
            {groupName} <IconCopy />
          </p>
        </div>
        <IconCross className="close-icon" data-testid="close-project-cell-menu" />
      </div>
      <div className="project-cell-menu-footer">
        <Button variant="supplementary" iconLeft={undefined} data-testid="open-group-edit-dialog">
          {t(`editGroup`)}
        </Button>
        <Button variant="supplementary" iconLeft={undefined} data-testid="open-delete-group-dialog">
          {t(`deleteGroup`)}
        </Button>
      </div>
    </div>
  );
};

export default memo(GroupRowContextMenu);
