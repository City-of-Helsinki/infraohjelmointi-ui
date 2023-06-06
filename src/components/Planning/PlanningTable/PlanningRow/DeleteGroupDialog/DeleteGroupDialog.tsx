import { FC, memo } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';
import Loader from '@/components/Loader';
import { IconAlertCircle, IconTrash } from 'hds-react/icons';

interface DeleteGroupDialogProps {
  isVisible: boolean;
  onCloseDeleteGroupDialog: () => void;
  groupName: string;
}

const DeleteGroupDialog: FC<DeleteGroupDialogProps> = memo(
  ({ isVisible, onCloseDeleteGroupDialog, groupName }) => {
    const { t } = useTranslation();

    const { Header, Content, ActionButtons } = Dialog;

    return (
      <div>
        {/* Dialog */}
        <div className="display-flex-col">
          <Dialog
            variant={'danger'}
            id="delete-group-dialog"
            aria-labelledby="delete-group-dialog"
            isOpen={isVisible}
          >
            <Header
              id={'delete-group-dialog-header'}
              title={t(`deleteGroupDialog.title`, { name: groupName })}
              iconLeft={<IconAlertCircle aria-hidden="true" />}
            />
            <Content>
              <p className="text-body">{t(`deleteGroupDialog.description`)}</p>
            </Content>
            <ActionButtons>
              <Button onClick={onCloseDeleteGroupDialog} theme="black" variant="secondary">
                {t(`cancel`)}
              </Button>
              <Button
                variant="danger"
                iconLeft={<IconTrash aria-hidden="true" />}
                onClick={() => {
                  // Add confirm operations here
                  close();
                }}
              >
                {t(`deleteGroup`)}
              </Button>
            </ActionButtons>
          </Dialog>
        </div>
      </div>
    );
  },
);

DeleteGroupDialog.displayName = 'Delete Group Dialog';

export default DeleteGroupDialog;
