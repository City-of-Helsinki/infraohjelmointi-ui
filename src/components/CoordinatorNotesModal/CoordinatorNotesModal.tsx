import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/common";
import { t } from "i18next";
import { selectNotesModalData, selectNotesModalOpen, setNotesModalOpen } from "@/reducers/planningSlice";
import { IconCross } from "hds-react";
import './styles.css';

interface ICoordinatorNotesProps {
    id: string;
}

const CoordinatorNotesModal = (props: ICoordinatorNotesProps) => {
    const dispatch = useAppDispatch();
    const handleClose = useCallback(async () => {
        dispatch(setNotesModalOpen(false))
    }, []);
console.log("modal id: ", props.id)
    const modalOpen = useAppSelector(selectNotesModalOpen);
    const modalData = useAppSelector(selectNotesModalData);

    return( 
        <>
            { modalOpen &&
                <section className="check-notes-dialog">
                    <section className="dialog-top-part">
                        <h1>{modalData.name}</h1>
                        <h2>{t('memo')}</h2>
                        <IconCross className="close-icon" onClick={() => handleClose()} />
                    </section>
                    <hr />
                    <section className="check-notes-dialog-middle-part">
                        <p>Ei vielä muistiinpanoja.</p>
                    </section>
                    <hr />
                    <section className="check-notes-dialog-bottom-part">
                        <button className="check-notes-dialog-add-note">Lisää uusi muistiinpano</button>
                    </section>
                </section>
            }
        </>
    );
};

export default CoordinatorNotesModal;