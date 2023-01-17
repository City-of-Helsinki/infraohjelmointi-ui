import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IClass } from '@/interfaces/classInterfaces';
import {
  setSelectedClass,
  setSelectedMasterClass,
  setSelectedSubClass,
} from '@/reducers/classSlice';
import { RootState } from '@/store';
import _ from 'lodash';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import PlanningClassesTableRow from './PlanningClassesTableRow';
import './styles.css';

// FIXME: this any will be removed ones we get the actual group model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PlanningClassesTable = () => {
  const { masterClassId, classId, subClassId } = useParams();
  const dispatch = useAppDispatch();
  const masterClasses = useAppSelector((state: RootState) => state.class.masterClasses, _.isEqual);
  const classes = useAppSelector((state: RootState) => state.class.classes, _.isEqual);
  const subClasses = useAppSelector((state: RootState) => state.class.subClasses, _.isEqual);
  const selectedMasterClass = useAppSelector(
    (state: RootState) => state.class.selectedMasterClass,
    _.isEqual,
  );
  const selectedClass = useAppSelector((state: RootState) => state.class.selectedClass, _.isEqual);

  /**
   * set selected classes to redux according to url, if their url param id is removed, then they will
   * be set to null (i.e, the user navigates back)
   */
  useEffect(() => {
    const masterClass = masterClassId
      ? (masterClasses.find((mc) => mc.id === masterClassId) as IClass)
      : null;
    dispatch(setSelectedMasterClass(masterClass));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterClassId, masterClasses]);

  useEffect(() => {
    const projectClass = classId ? (classes.find((c) => c.id === classId) as IClass) : null;
    dispatch(setSelectedClass(projectClass));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, classes]);

  useEffect(() => {
    const subClass = subClassId ? (subClasses.find((sc) => sc.id === subClassId) as IClass) : null;
    dispatch(setSelectedSubClass(subClass));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subClassId, subClasses]);

  const allMasterClassRows = () =>
    masterClasses.map((mc) => (
      <PlanningClassesTableRow key={mc.id} projectClass={mc} type="masterClass" />
    ));

  const allClassRows = () =>
    [...classes.filter((c) => c.parent === selectedMasterClass?.id)].map((c) => (
      <PlanningClassesTableRow key={c.id} projectClass={c} type="class" />
    ));

  const allSubClassRows = () =>
    [...subClasses.filter((sc) => sc.parent === selectedClass?.id)].map((sc) => (
      <PlanningClassesTableRow key={sc.id} projectClass={sc} type="subClass" />
    ));

  return (
    <table className="planning-table" cellSpacing={0}>
      <tbody>
        {
          // When a masterClass is selected, render only that masterClass
          selectedMasterClass ? (
            <PlanningClassesTableRow
              key={selectedMasterClass.id}
              projectClass={selectedMasterClass}
              initiallyExpanded={true}
              type="masterClass"
            >
              {
                // When a class is selected, render only that class
                selectedClass ? (
                  <PlanningClassesTableRow
                    key={selectedClass.id}
                    projectClass={selectedClass}
                    initiallyExpanded={true}
                    type="class"
                  >
                    {
                      // Always render all subClasses
                      allSubClassRows()
                    }
                  </PlanningClassesTableRow>
                ) : (
                  // When no class is selected, render all classes
                  allClassRows()
                )
              }
            </PlanningClassesTableRow>
          ) : (
            // When no masterClass is selected, render all masterClasses
            allMasterClassRows()
          )
        }
      </tbody>
    </table>
  );
};

export default PlanningClassesTable;
