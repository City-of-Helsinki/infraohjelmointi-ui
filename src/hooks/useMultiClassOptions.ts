import { IOption } from '@/interfaces/common';
import {
  selectPlanningClasses,
  selectPlanningMasterClasses,
  selectPlanningSubClasses,
} from '@/reducers/classSlice';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from './common';
import _ from 'lodash';
import { classesToOptions } from '@/utils/common';

/**
 * Populates the masterClass, class and subClass lists. Filters the available options of the lists
 * to only include "sibling" classes.
 *
 * @param masterClasses selected masterClass options
 * @param classes selected class options
 * @param subClasses selected subClass options
 */
const useMultiClassOptions = (
  masterClasses: Array<IOption>,
  classes: Array<IOption>,
  subClasses: Array<IOption>,
) => {
  const allMasterClasses = useAppSelector(selectPlanningMasterClasses);
  const allClasses = useAppSelector(selectPlanningClasses);
  const allSubClasses = useAppSelector(selectPlanningSubClasses);

  const selectedClassParents = useMemo(
    () =>
      allClasses
        .filter((ac) => classes.findIndex((c) => c.value === ac.id) !== -1)
        .map((c) => c.parent),
    [allClasses, classes],
  );

  const selectedSubClassParents = useMemo(
    () =>
      allSubClasses
        .filter((asc) => subClasses.findIndex((sc) => sc.value === asc.id) !== -1)
        .map((sc) => sc.parent),
    [allSubClasses, subClasses],
  );

  const getNextClasses = useCallback(() => {
    if (!_.isEmpty(subClasses)) {
      return allClasses.filter(
        (c) => selectedSubClassParents.findIndex((sc) => sc === c.id) !== -1,
      );
    } else if (!_.isEmpty(masterClasses)) {
      return allClasses.filter(
        (c) => masterClasses.findIndex((mc) => mc.value === c.parent) !== -1,
      );
    } else {
      return allClasses;
    }
  }, [allClasses, masterClasses, selectedSubClassParents, subClasses]);

  const getNextSubClasses = useCallback(() => {
    if (!_.isEmpty(classes)) {
      return allSubClasses.filter((sc) => classes.findIndex((fc) => sc.parent === fc.value) !== -1);
    } else if (!_.isEmpty(masterClasses)) {
      return allSubClasses.filter(
        (sc) => getNextClasses().findIndex((fc) => sc.parent === fc.id) !== -1,
      );
    } else {
      return allSubClasses;
    }
  }, [allSubClasses, classes, getNextClasses, masterClasses]);

  const getNextMasterClasses = useCallback(() => {
    if (!_.isEmpty(classes)) {
      return allMasterClasses.filter(
        (mc) => selectedClassParents.findIndex((c) => c === mc.id) !== -1,
      );
    } else if (!_.isEmpty(subClasses)) {
      return allMasterClasses.filter(
        (mc) => getNextClasses().findIndex((sc) => sc.parent === mc.id) !== -1,
      );
    } else {
      return allMasterClasses;
    }
  }, [allMasterClasses, classes, getNextClasses, selectedClassParents, subClasses]);

  return {
    masterClasses: classesToOptions(getNextMasterClasses()),
    classes: classesToOptions(getNextClasses()),
    subClasses: classesToOptions(getNextSubClasses()),
  };
};

export default useMultiClassOptions;
