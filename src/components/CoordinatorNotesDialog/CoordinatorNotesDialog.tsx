import { FC, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/common";
import { t } from "i18next";
import { selectNotesDialogData, selectNotesDialogOpen, setNotesDialogOpen } from "@/reducers/planningSlice";
import { Button, IconCross } from "hds-react";
import { Dialog } from 'hds-react/components/Dialog';
import './styles.css';

const CoordinatorNotesDialog: FC = () => {
    const dispatch = useAppDispatch();

    const titleId = 'add-hashtag-title';
    const descriptionId = 'add-hashtag-content';

    const handleClose = useCallback(async () => {
        dispatch(setNotesDialogOpen(false))
      }, []);

    const dialogOpen = useAppSelector(selectNotesDialogOpen);
    const dialogData = useAppSelector(selectNotesDialogData);

    return( 
        <>
            {dialogOpen && 
                <Dialog
                    id="add-hashtag-dialog"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    isOpen={dialogOpen}
                    close={handleClose}
                    closeButtonLabelText="Close add hashtag dialog"
                >
                    <section className="dialog-top-part">
                        <h1>{t('addNote')} {dialogData.name} </h1>
                        <IconCross className="close-icon" onClick={() => handleClose()} />
                    </section>
                    <hr />
                    <section className="dialog-middle-part">
                        <h2>{t('note')} *</h2>
                        <textarea className="dialog-textarea"></textarea>
                    </section>
                    <hr />
                    <section className="dialog-bottom-part">
                        <Button id="add-note-button" onClick={() => handleClose()} variant="primary" data-testid="cancel-note">
                            {t('addNote')}
                        </Button>
                        <Button onClick={() => handleClose()} variant="secondary" data-testid="cancel-note">
                            {t('cancel')}
                        </Button>
                    </section>
                </Dialog>
            }
        </>
    );
};

export default CoordinatorNotesDialog;