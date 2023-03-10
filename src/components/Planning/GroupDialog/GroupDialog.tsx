import { useState, MouseEvent, FC, useCallback } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import { useTranslation } from 'react-i18next';
import './styles.css';
import GroupForm from './GroupForm';

interface IDialogState {
  isOpen: boolean;
}

const GroupDialog: FC = () => {
  const { Header, Content } = Dialog;
  const { t } = useTranslation();

  const [dialogState, setDialogState] = useState<IDialogState>({
    isOpen: false,
  });

  const { isOpen } = dialogState;

  const handleSetOpen = useCallback(
    () =>
      setDialogState((current) => ({
        ...current,
        isOpen: !current.isOpen,
      })),
    [],
  );
  const onOpenGroupForm = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      handleSetOpen();
    },
    [handleSetOpen],
  );
  const handleClose = useCallback(() => {
    // reset(formValues);
    handleSetOpen();

    // Also populate class and location lists back to full values
  }, [handleSetOpen]);

  return (
    <div className="input-wrapper">
      {/* Dialog */}
      <div className="display-flex-col">
        <Dialog
          id="group-create-dialog"
          aria-labelledby={'group-form-dialog-label'}
          isOpen={isOpen}
          close={handleClose}
          closeButtonLabelText={t('closeGroupFormWindow')}
          className="big-dialog"
          scrollable
        >
          {/* Header */}
          <Header id={'group-form-dialog-label'} title={t(`createSummingGroups`)} />

          <Content>
            <div className="dialog-section">
              <br />
              <div>
                <p className="font-bold">{t(`groupForm.groupCreationDescription1`)}</p>
                <p className="font-bold">{t(`groupForm.groupCreationDescription2`)}</p>
              </div>
              <GroupForm handleClose={handleClose} />
            </div>
          </Content>
        </Dialog>

        {/* Displayed on form (Open dialog button) */}
        <div className="hashtags-label">
          <div data-testid="open-group-form-dialog-button"></div>
          <Button onClick={onOpenGroupForm} size="small">
            {t(`createSummingGroups`)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupDialog;
