import { IOption } from '@/interfaces/common';
import { selectClasses, selectMasterClasses, selectSubClasses } from '@/reducers/classSlice';
import { setClassList, setMasterClassList, setSubClassList } from '@/reducers/listsSlice';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';

/**
 * Creates lists of masterClasses, classes and subClasses. If filtering is used, then all
 * classes and subClasses will be filtered according to their parent.
 *
 * @param withFilter boolean if filtering should be used
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

  const populateAllLists = useCallback(() => {
    dispatch(setMasterClassList(allMasterClasses));
    dispatch(setClassList(allClasses));
    dispatch(setSubClassList(allSubClasses));
  }, [dispatch, allMasterClasses, allClasses, allSubClasses]);

  // Populate lists when classes get fetched to redux
  useEffect(() => {
    populateAllLists();
  }, [allMasterClasses, allClasses, allSubClasses]);

  // Populate lists when all selections are empty
  useEffect(() => {
    populateAllLists();
  }, [masterClasses, classes, subClasses]);

  // Set class and subClass list that belong to the selected masterClasses
  useEffect(() => {
    if (masterClasses.length > 0) {
      const filteredClasses = allClasses.filter(
        (c) => masterClasses.findIndex((mc) => mc.value === c.parent) !== -1,
      );
      const filteredSubClasses = allSubClasses.filter(
        (sc) => filteredClasses.findIndex((fc) => sc.parent === fc.id) !== -1,
      );
      dispatch(setClassList(filteredClasses));
      dispatch(setSubClassList(filteredSubClasses));
    } else {
      if (classes.length === 0) {
        dispatch(setClassList(allClasses));
      }
      if (subClasses.length === 0) {
        const filteredSubClasses =
          classes.length > 0
            ? allSubClasses.filter((sc) => classes.findIndex((fc) => sc.parent === fc.value) !== -1)
            : allSubClasses;
        dispatch(setSubClassList(filteredSubClasses));
      }
    }
  }, [masterClasses]);

  // Set subClass and masterClass list that belong to the selected classes
  useEffect(() => {
    // if (classes.length > 0) {
    // }
    if (classes.length > 0) {
      const classParents = allClasses
        .filter((ac) => classes.findIndex((c) => c.value === ac.id) !== -1)
        .map((c) => c.parent);

      const filteredSubClasses = allSubClasses.filter(
        (sc) => classes.findIndex((c) => c.value === sc.parent) !== -1,
      );

      const filteredMasterClasses = allMasterClasses.filter(
        (mc) => classParents.findIndex((cp) => cp === mc.id) !== -1,
      );

      dispatch(setSubClassList(filteredSubClasses));
      dispatch(setMasterClassList(filteredMasterClasses));
    } else {
      if (masterClasses.length !== 0) {
        const filteredClasses = allClasses.filter(
          (c) => masterClasses.findIndex((mc) => mc.value === c.parent) !== -1,
        );
        const filteredSubClasses = allSubClasses.filter(
          (sc) => filteredClasses.findIndex((fc) => sc.parent === fc.id) !== -1,
        );
        dispatch(setSubClassList(filteredSubClasses));
      }
    }
  }, [classes]);

  // Set class and masterClass list that belong to the selected subClasses
  useEffect(() => {
    if (subClasses.length > 0) {
      const subClassParents = allSubClasses
        .filter((asc) => subClasses.findIndex((sc) => sc.value === asc.id) !== -1)
        .map((sc) => sc.parent);

      const classParents = allClasses
        .filter((ac) => subClassParents.findIndex((scp) => scp === ac.id) !== -1)
        .map((cp) => cp.parent);

      const filteredClasses = allClasses.filter(
        (ac) => subClassParents.findIndex((scp) => scp === ac.id) !== -1,
      );

      const filteredMasterClasses = allMasterClasses.filter(
        (mc) => classParents.findIndex((cp) => cp === mc.id) !== -1,
      );
      dispatch(setClassList(filteredClasses));
      dispatch(setMasterClassList(filteredMasterClasses));
    } else {
      if (masterClasses.length !== 0) {
        const filteredClasses = allClasses.filter(
          (c) => masterClasses.findIndex((mc) => mc.value === c.parent) !== -1,
        );
        dispatch(setClassList(filteredClasses));
      }
    }
  }, [subClasses]);
};

export default useMultiClassList;
