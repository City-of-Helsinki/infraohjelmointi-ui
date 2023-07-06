import {
  selectPlanningClasses,
  selectPlanningSubClasses,
  selectPlanningMasterClasses,
} from '@/reducers/classSlice';
import { classesToOptions } from '@/utils/common';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from './common';

/**
 * Creates lists of masterClasses, classes and subClasses. If filtering is used, then all
 * classes and subClasses will be filtered according to their parent.
 *
 * @param withFilter boolean if filtering should be used
 */
const useClassOptions = (currentClass: string | undefined) => {
  const masterClasses = useAppSelector(selectPlanningMasterClasses);
  const classes = useAppSelector(selectPlanningClasses);
  const subClasses = useAppSelector(selectPlanningSubClasses);

  const selectedMasterClass = useMemo(
    () => masterClasses && masterClasses.find((mc) => mc.id === currentClass),
    [currentClass, masterClasses],
  );

  const selectedClass = useMemo(
    () => classes && classes.find((c) => c.id === currentClass),
    [currentClass, classes],
  );

  const selectedSubClass = useMemo(
    () => subClasses && subClasses.find((sc) => sc.id === currentClass),
    [currentClass, subClasses],
  );

  const getNextClasses = useCallback(() => {
    if (selectedMasterClass) {
      return classes.filter((c) => c.parent === currentClass);
    } else if (selectedClass) {
      const classParent = masterClasses.find((mc) => mc.id === selectedClass.parent);
      return classes.filter((c) => c.parent === classParent?.id);
    } else if (selectedSubClass) {
      const subClassParent = classes.find((c) => c.id === selectedSubClass.parent);
      const classParent = masterClasses.find((mc) => mc.id === subClassParent?.parent);
      return classes.filter((c) => c.parent === classParent?.id);
    } else {
      return [];
    }
  }, [classes, currentClass, masterClasses, selectedClass, selectedMasterClass, selectedSubClass]);

  const getNextSubClasses = useCallback(() => {
    if (selectedClass) {
      return subClasses.filter((sc) => sc.parent === currentClass);
    } else if (selectedSubClass) {
      const subClassParent = classes.find((c) => c.id === selectedSubClass.parent);
      return subClasses.filter((sc) => sc.parent === subClassParent?.id);
    } else {
      return [];
    }
  }, [classes, currentClass, selectedClass, selectedSubClass, subClasses]);

  return {
    masterClasses: classesToOptions(masterClasses),
    classes: classesToOptions(getNextClasses()),
    subClasses: classesToOptions(getNextSubClasses()),
  };
};

export default useClassOptions;
