import { useCallback, Fragment } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/common";
import { t } from "i18next";
import { selectNotes, selectNotesModalData, selectNotesModalOpen, setNotesDialogData, setNotesDialogOpen, setNotesModalOpen } from "@/reducers/planningSlice";
import { IconCross } from "hds-react";
import './styles.css';
import { dateStringToMoment } from "@/utils/dates";

interface ICoordinatorNotesProps {
    id: string;
    type: string;
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
                note.year === props.selectedYear && note.coordinatorClass === props.id
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
    
    const split = (str: string, index: number) => [str.slice(0, index), str.slice(index)][1];

    const formatClassName = () => {
        // delete numbers from the start of the name
        switch(props.type) {
            case 'masterClass': {
                return split(modalData.name, 4);
            }   
            case 'class': {
                return split(modalData.name, 8);
            }
            case 'subClass': {
                return split(modalData.name, 11);
            }
            default: {
                return modalData.name;
            }
        }
    }

    return( 
        <>
            { modalOpen.isOpen && modalOpen.id === props.id &&
                <section className="dialog-container">
                    <section className="dialog-top-part">
                        <div id="left">
                            <h1>{formatClassName()}</h1>
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