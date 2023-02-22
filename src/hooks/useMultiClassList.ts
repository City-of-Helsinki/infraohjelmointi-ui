import { IOption } from '@/interfaces/common';
import { selectClasses, selectMasterClasses, selectSubClasses } from '@/reducers/classSlice';
import { setClassList, setMasterClassList, setSubClassList } from '@/reducers/listsSlice';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';
import _ from 'lodash';

/**
 * Populates the masterClass, class and subClass lists. Filters the available options of the lists
 * to only include "sibling" classes.
 *
 * @param masterClasses selected masterClass options
 * @param classes selected class options
 * @param subClasses selected subClass options
 */
const useMultiClassList = (
  masterClasses: Array<IOption>,
  classes: Array<IOption>,
  subClasses: Array<IOption>,
) => {
  const allMasterClasses = useAppSelector(selectMasterClasses);
  const allClasses = useAppSelector(selectClasses);
  const allSubClasses = useAppSelector(selectSubClasses);

  const dispatch = useAppDispatch();

  // Populate lists when classes get populated to redux
  useEffect(() => {
    dispatch(setMasterClassList(allMasterClasses));
    dispatch(setClassList(allClasses));
    dispatch(setSubClassList(allSubClasses));
  }, [allMasterClasses, allClasses, allSubClasses]);

  useEffect(() => {
    const selectedClassParents = allClasses
      .filter((ac) => classes.findIndex((c) => c.value === ac.id) !== -1)
      .map((c) => c.parent);

    const selectedSubClassParents = allSubClasses
      .filter((asc) => subClasses.findIndex((sc) => sc.value === asc.id) !== -1)
      .map((sc) => sc.parent);

    const nextClasses = !_.isEmpty(subClasses)
      ? allClasses.filter((c) => selectedSubClassParents.findIndex((sc) => sc === c.id) !== -1)
      : !_.isEmpty(masterClasses)
      ? allClasses.filter((c) => masterClasses.findIndex((mc) => mc.value === c.parent) !== -1)
      : allClasses;

    const nextSubClasses = !_.isEmpty(classes)
      ? allSubClasses.filter((sc) => classes.findIndex((fc) => sc.parent === fc.value) !== -1)
      : !_.isEmpty(masterClasses)
      ? allSubClasses.filter((sc) => nextClasses.findIndex((fc) => sc.parent === fc.id) !== -1)
      : allSubClasses;

    const nextMasterClasses = !_.isEmpty(classes)
      ? allMasterClasses.filter((mc) => selectedClassParents.findIndex((c) => c === mc.id) !== -1)
      : !_.isEmpty(subClasses)
      ? allMasterClasses.filter((mc) => nextClasses.findIndex((sc) => sc.parent === mc.id) !== -1)
      : allMasterClasses;

    dispatch(setMasterClassList(nextMasterClasses));
    dispatch(setSubClassList(nextSubClasses));
    dispatch(setClassList(nextClasses));
  }, [masterClasses, classes, subClasses]);
};

export default useMultiClassList;
