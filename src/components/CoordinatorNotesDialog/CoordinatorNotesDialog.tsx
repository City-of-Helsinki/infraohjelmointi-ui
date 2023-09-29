import { FC, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/common";
import { t } from "i18next";
import { getCoordinatorNotesByProjectThunk, postCoordinatorNoteToProjectThunk, selectNotesDialogData, selectNotesDialogOpen, setNotesDialogOpen } from "@/reducers/planningSlice";
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import { Button, IconCross } from "hds-react";
import { Dialog } from 'hds-react/components/Dialog';
import './styles.css';
import { ICoordinatorNoteRequest } from "@/interfaces/noteInterfaces";
import { selectUser } from "@/reducers/authSlice";

const CoordinatorNotesDialog: FC = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const dialogOpen = useAppSelector(selectNotesDialogOpen);
    const dialogData = useAppSelector(selectNotesDialogData);
    const [textAreaContent, setTextAreaContent] = useState('');
    const noteId = 'add-coordinator-note-title';
    const descriptionId = 'add-coordinator-note-content';

    const handleClose = useCallback(async () => {
        dispatch(setNotesDialogOpen(false))
    }, []);

    const handleSubmit = async () => {
        const data = {
            coordinatorNote: textAreaContent, 
            planningClass: dialogData.name,
            planningClassId: dialogData.id,
            updatedByFirstName: user?.first_name || 'null',
            updatedByLastName: user?.last_name || 'null',
            updatedById: user?.id || 'null',
            year: String(dialogData.selectedYear),
        }
        
        const setSuccessNotification = (name: string) => {
                dispatch(notifySuccess({
                    message: 'noteAddedToClass',
                    title: 'noteAddSuccess',
                    type: 'toast',
                    duration: 3000,
                    parameter: name
                    }),
                );
        };

        const setErrorNotification = () => {
            dispatch(notifyError({
                title: 'noteAddError',
                type: 'toast',
                duration: 3000,
                }),
            );
        }
        if (textAreaContent.length > 0) {
            const res = await dispatch(postCoordinatorNoteToProjectThunk(data as ICoordinatorNoteRequest))
            try {
                if (!res.type.includes('rejected')) {
                    setSuccessNotification(dialogData.name);
                    setTextAreaContent('');
                    handleClose();
                    dispatch(getCoordinatorNotesByProjectThunk());
                }  else {
                    setErrorNotification();
                }
            } catch (e) {
                setErrorNotification();
            }
        }
    }

    return( 
        <>
            {dialogOpen && 
                <Dialog
                    id={noteId}
                    aria-labelledby={noteId}
                    aria-describedby={descriptionId}
                    isOpen={dialogOpen}
                    close={handleClose}
                    closeButtonLabelText={t('closeCoordinatorNotesDialog')}
                >
                    <form>
                        <section className="dialog-top-part">
                            <h1>{t('addNote')} {dialogData.name} </h1>
                            <IconCross className="close-icon" onClick={() => handleClose()} />
                        </section>
                        <hr />
                        <section className="dialog-middle-part">
                            <h2>{t('note')} *</h2>
                            <textarea 
                                className="dialog-textarea"
                                value={textAreaContent}
                                onChange={e => setTextAreaContent(e.target.value)}
                                required
                            ></textarea>
                        </section>
                        <hr />
                        <section className="dialog-bottom-part">
                            <Button id="add-note-button" onClick={() => handleSubmit()} variant="primary" data-testid="cancel-note">
                                {t('addNote')}
                            </Button>
                            <Button onClick={() => handleClose()} variant="secondary" data-testid="cancel-note">
                                {t('cancel')}
                            </Button>
                        </section>
                    </form>
                </Dialog>
            }
        </>
    );
};

export default CoordinatorNotesDialog;