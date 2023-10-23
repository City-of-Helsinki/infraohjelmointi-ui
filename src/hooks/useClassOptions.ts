import {
  selectPlanningClasses,
  selectPlanningSubClasses,
  selectPlanningMasterClasses,
  selectPlanningOtherClassifications,
} from '@/reducers/classSlice';
import { classesToOptions } from '@/utils/common';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from './common';
import { selectUser } from '@/reducers/authSlice';
import {
  isUserAdmin,
  isUserCoordinator,
  isUserOnlyProjectAreaPlanner,
  isUserPlanner,
} from '@/utils/userRoleHelpers';

/**
 * Creates lists of masterClasses, classes and subClasses. If filtering is used, then all
 * classes and subClasses will be filtered according to their parent.
 *
 * @param withFilter boolean if filtering should be used
 */
const useClassOptions = (currentClass: string | undefined) => {
  const user = useAppSelector(selectUser);
  const masterClasses = useAppSelector(selectPlanningMasterClasses);
  const classes = useAppSelector(selectPlanningClasses);
  const subClasses = useAppSelector(selectPlanningSubClasses);
  const otherClassifications = useAppSelector(selectPlanningOtherClassifications);

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

  const getNextOtherClassifications = useCallback(() => {
    if (selectedSubClass){
      const asd = subClasses.find((sc) => sc.parent === selectedSubClass.parent);
      return otherClassifications.filter((oc) => oc.parent === asd?.id);
    } else {
      return [];
    }
  }, [classes, currentClass, selectedSubClass, subClasses, otherClassifications]);

  const filteredMasterClasses = useMemo(() => {
    if (
      isUserOnlyProjectAreaPlanner(user) &&
      (!selectedMasterClass?.name.startsWith('808') ||
        !selectedMasterClass?.name.startsWith('8 08'))
    ) {
      return masterClasses.filter((mc) => mc.name.startsWith('808') || mc.name.startsWith('8 08'));
    } else if (isUserPlanner(user) || isUserCoordinator(user) || isUserAdmin(user)) {
      return masterClasses;
    } else return [];
  }, [user, masterClasses]);

  return {
    masterClasses: classesToOptions(filteredMasterClasses),
    classes: classesToOptions(getNextClasses()),
    subClasses: classesToOptions(getNextSubClasses()),
    otherClassifications: classesToOptions(getNextOtherClassifications()),
  };
};

export default useClassOptions;
