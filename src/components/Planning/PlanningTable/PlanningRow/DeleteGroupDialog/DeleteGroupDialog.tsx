import { FC, memo, useCallback } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';
import { IconAlertCircle, IconTrash } from 'hds-react/icons';
import { deleteGroupThunk } from '@/reducers/groupSlice';
import { useAppDispatch } from '@/hooks/common';
import './styles.css';

interface DeleteGroupDialogProps {
  isVisible: boolean;
  onCloseDeleteGroupDialog: () => void;
  groupName: string;
  id: string;
}

const DeleteGroupDialog: FC<DeleteGroupDialogProps> = memo(
  ({ isVisible, onCloseDeleteGroupDialog, groupName, id }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const handleDeleteGroup = useCallback(() => {
      dispatch(deleteGroupThunk(id))
        .then(() => onCloseDeleteGroupDialog())
        .catch(Promise.reject);
    }, [dispatch, id, onCloseDeleteGroupDialog]);
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
                data-testid={`delete-group-${id}`}
                variant="danger"
                iconLeft={<IconTrash aria-hidden="true" />}
                onClick={handleDeleteGroup}
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
