import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/common";
import { t } from "i18next";
import { selectNotesModalData, selectNotesModalOpen, setNotesDialogData, setNotesDialogOpen, setNotesModalOpen } from "@/reducers/planningSlice";
import { IconCross } from "hds-react";
import './styles.css';

interface ICoordinatorNotesProps {
    id: string;
}

const CoordinatorNotesModal = (props: ICoordinatorNotesProps) => {
    const dispatch = useAppDispatch();
    const handleClose = useCallback(async () => {
        dispatch(setNotesModalOpen({isOpen: false, id: props.id}))
    }, []);

    const modalOpen = useAppSelector(selectNotesModalOpen);
    const modalData = useAppSelector(selectNotesModalData);

    return( 
        <>
            { modalOpen.isOpen && modalOpen.id === props.id &&
                <section className="dialog-container">
                    <section className="dialog-top-part">
                        <div id="left">
                            <h1>{modalData.name}</h1>
                            <h2>{t('memo')}</h2>
                        </div>
                        <div id="right">
                            <IconCross className="close-icon" onClick={() => handleClose()} />
                        </div>
                    </section>
                    <hr />
                    <section className="dialog-middle-part">
                        <p>{t('noNotesYet')}</p>
                    </section>
                    <hr />
                    <section className="dialog-bottom-part">
                        <button className="dialog-add-note" onClick={() => {dispatch(setNotesDialogOpen(true)); dispatch(setNotesDialogData({name: modalData.name, id: props.id}))}}>{t('addNewNote')}</button>
                    </section>
                </section>
            }
        </>
    );
};

export default CoordinatorNotesModal;