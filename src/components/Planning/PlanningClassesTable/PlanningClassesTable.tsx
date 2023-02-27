import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IClass } from '@/interfaces/classInterfaces';
import { ClassTableHierarchy } from '@/interfaces/common';
import {
  selectClasses,
  selectMasterClasses,
  selectSelectedClass,
  selectSelectedMasterClass,
  selectSelectedSubClass,
  selectSubClasses,
  setSelectedClass,
  setSelectedMasterClass,
  setSelectedSubClass,
} from '@/reducers/classSlice';
import { memo, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import PlanningClassesTableRow from './PlanningClassesTableRow';
import './styles.css';

const PlanningClassesTable = () => {
  const { masterClassId, classId, subClassId } = useParams();
  const dispatch = useAppDispatch();
  const masterClasses = useAppSelector(selectMasterClasses);
  const classes = useAppSelector(selectClasses);
  const subClasses = useAppSelector(selectSubClasses);
  const selectedMasterClass = useAppSelector(selectSelectedMasterClass);
  const selectedClass = useAppSelector(selectSelectedClass);
  const selectedSubClass = useAppSelector(selectSelectedSubClass);

  /**
   * set selected classes to redux according to url, if their url param id is removed, then they will
   * be set to null (i.e, the user navigates back)
   */
  useEffect(() => {
    const masterClass = masterClassId
      ? (masterClasses.find((mc) => mc.id === masterClassId) as IClass)
      : null;
    dispatch(setSelectedMasterClass(masterClass));
  }, [masterClassId, masterClasses]);

  useEffect(() => {
    const projectClass = classId ? (classes.find((c) => c.id === classId) as IClass) : null;
    dispatch(setSelectedClass(projectClass));
  }, [classId, classes]);

  useEffect(() => {
    const subClass = subClassId ? (subClasses.find((sc) => sc.id === subClassId) as IClass) : null;
    dispatch(setSelectedSubClass(subClass));
  }, [subClassId, subClasses]);

  const allMasterClassRows = useCallback(
    () =>
      masterClasses.map((mc) => (
        <PlanningClassesTableRow
          key={mc.id}
          projectClass={mc}
          hierarchy={ClassTableHierarchy.First}
        />
      )),
    [masterClasses],
  );

  const allClassRows = useCallback(
    () =>
      selectedMasterClass
        ? [...classes.filter((c) => c.parent === selectedMasterClass?.id)].map((c) => (
            <PlanningClassesTableRow
              key={c.id}
              projectClass={c}
              hierarchy={ClassTableHierarchy.Second}
            />
          ))
        : null,
    [classes, selectedMasterClass],
  );

  const allSubClassRows = useCallback(
    () =>
      selectedClass
        ? [...subClasses.filter((sc) => sc.parent === selectedClass?.id)].map((sc) => (
            <PlanningClassesTableRow
              key={sc.id}
              projectClass={sc}
              hierarchy={ClassTableHierarchy.Third}
            />
          ))
        : null,
    [subClasses, selectedClass],
  );

  return (
    <table className="planning-table" cellSpacing={0}>
      <tbody>
        {
          // Render all classes if no subClass is selected
          !selectedSubClass ? (
            // When a masterClass is selected, render only that masterClass
            selectedMasterClass ? (
              <PlanningClassesTableRow
                key={selectedMasterClass.id}
                projectClass={selectedMasterClass}
                initiallyExpanded={true}
                hierarchy={ClassTableHierarchy.First}
              >
                {
                  // When a class is selected, render only that class
                  selectedClass ? (
                    <PlanningClassesTableRow
                      key={selectedClass.id}
                      projectClass={selectedClass}
                      initiallyExpanded={true}
                      hierarchy={ClassTableHierarchy.Second}
                    >
                      {
                        // When no subClass is selected, render all subClasses
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
          ) : (
            // Render only the selectedSubClass and the projects associated with it if selected
            <PlanningClassesTableRow
              key={selectedSubClass.id}
              projectClass={selectedSubClass}
              initiallyExpanded={true}
              hierarchy={ClassTableHierarchy.First}
            />
          )
        }
      </tbody>
    </table>
  );
};

export default memo(PlanningClassesTable);
