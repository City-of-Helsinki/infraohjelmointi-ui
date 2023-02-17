import { useState, MouseEvent, FC, forwardRef, Ref, useEffect, memo, useCallback } from 'react';
import { Button } from 'hds-react/components/Button';
import { Dialog } from 'hds-react/components/Dialog';
import FormFieldLabel from '../../shared/FormFieldLabel';
import { useTranslation } from 'react-i18next';
import Paragraph from '../../shared/Paragraph';
interface IFormState {
  isOpen: boolean;
}

const GroupDialog: FC = () => {
  const { Header, Content, ActionButtons } = Dialog;
  const { t } = useTranslation();
  const [formState, setFormState] = useState<IFormState>({
    isOpen: false,
  });
  const { isOpen } = formState;
  const handleSetOpen = useCallback(
    () => setFormState((current) => ({ isOpen: !current.isOpen })),
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
    handleSetOpen();
  }, [handleSetOpen]);
  return (
    <div className="input-wrapper">
      {/* Dialog */}
      <div className="display-flex-col">
        <Dialog
          id="group-form-dialog"
          aria-labelledby={'group-form-dialog-label'}
          isOpen={isOpen}
          close={handleClose}
          closeButtonLabelText={t('closeGroupFormWindow')}
          className="big-dialog"
        >
          {/* Header */}
          <Header id={'group-form-dialog-label'} title={t(`createSummingGroups`)} />
          <hr />
          {/* Section 1 (Added hashtags ) */}
          <Content>
            <div className="content-container">
              <Paragraph text={t('projectHashTags') || ''} />
              Hello
            </div>
          </Content>
          <hr />

          {/* Footer (Save button)
          <ActionButtons>
            <div className="dialog-footer">
              <div data-testid="save-hash-tags-to-project">
                <Button onClick={onSubmit}>{t('save')}</Button>
              </div>
            </div>
          </ActionButtons> */}
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
