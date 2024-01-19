import { useCallback } from "react";
import { t } from "i18next";

import { Button, IconQuestionCircle } from "hds-react";
import { Dialog } from 'hds-react/components/Dialog';
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/common";
import { selectConfirmPromptOpen, setConfirmPromptOpen } from "@/reducers/planningSlice";

export const ConfirmPrompt = () => {
    const dispatch = useAppDispatch();
    const dialogOpen = useAppSelector(selectConfirmPromptOpen);

    const path = useLocation().pathname;
    const navigate = useNavigate();

    const noteId = 'project-form-confirm-prompt';
    const descriptionId = 'project-form-confirm-prompt';

    const handleClose = useCallback(async () => {
        dispatch(setConfirmPromptOpen(false))
    }, []);

    const handleSubmit = async () => {
        dispatch(setConfirmPromptOpen(false));
       if (path.includes("basics")) {
        navigate('notes');
       } else {
        navigate('basics');
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
                    variant="primary"
                >
                    <Dialog.Header id={'titleId'} title={t('confirmLeaveTitle')} iconLeft={<IconQuestionCircle aria-hidden="true" />} />
                    <Dialog.Content>
                        <p>{t('confirmLeaveDescription')}</p>
                    </Dialog.Content>
                    <Dialog.ActionButtons>
                        <Button onClick={() => handleClose()} variant="secondary">
                            {t('cancel')}
                        </Button>
                        <Button onClick={() => handleSubmit()} variant="primary">
                            {t('proceed')}
                        </Button>
                    </Dialog.ActionButtons>
                </Dialog>
            }
        </>
    );
};

export default ConfirmPrompt;