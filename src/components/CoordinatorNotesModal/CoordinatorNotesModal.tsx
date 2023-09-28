import { useCallback, Fragment } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/common";
import { t } from "i18next";
import { selectNotes, selectNotesModalData, selectNotesModalOpen, setNotesDialogData, setNotesDialogOpen, setNotesModalOpen } from "@/reducers/planningSlice";
import { IconCross } from "hds-react";
import './styles.css';
import { dateStringToMoment } from "@/utils/dates";

interface ICoordinatorNotesProps {
    id: string;
    selectedYear: number|null;
}

const CoordinatorNotesModal = (props: ICoordinatorNotesProps) => {
    const dispatch = useAppDispatch();
    const handleClose = useCallback(async () => {
        dispatch(setNotesModalOpen({isOpen: false, id: props.id}))
    }, []);

    const notes = useAppSelector(selectNotes);
    const modalOpen = useAppSelector(selectNotesModalOpen);
    const modalData = useAppSelector(selectNotesModalData);

    const Notes = () => {
        if (notes.length) {
            const matchingNotes = notes.filter((note) => (
                note.year === String(props.selectedYear) && note.planningClassId === props.id
            ));
            const mappedNotes = matchingNotes.map((note, index) => {
                return (
                    <Fragment key={index}>
                        <p>{note.coordinatorNote}</p>
                        <p id="coordinator">{note.updatedByFirstName} {note.updatedByLastName}</p>
                        <p id="date">{dateStringToMoment(note.createdDate)}</p>
                    </Fragment>
                )
            });
            return mappedNotes.length ? <p>{mappedNotes}</p> : <p>{t('noNotesYet')}</p>;
        }
        return <p>{t('noNotesYet')}</p>;
    };
    
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
                        <Notes />
                    </section>
                    <hr />
                    <section className="dialog-bottom-part">
                        <button className="dialog-add-note" onClick={() => {
                                dispatch(setNotesDialogOpen(true)); 
                                dispatch(setNotesDialogData({name: modalData.name, id: props.id, selectedYear: props.selectedYear}))}
                            }>{t('addNewNote')}
                        </button>
                    </section>
                </section>
            }
        </>
    );
};

export default CoordinatorNotesModal;