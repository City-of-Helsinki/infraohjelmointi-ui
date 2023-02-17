import { selectClasses, selectMasterClasses, selectSubClasses } from '@/reducers/classSlice';
import {
  selectMasterClassList,
  setClassList,
  setMasterClassList,
  setSubClassList,
} from '@/reducers/listsSlice';
import { selectProject } from '@/reducers/projectSlice';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';

/**
 * Creates lists of masterClasses, classes and subClasses. If filtering is used, then all
 * classes and subClasses will be filtered according to their parent.
 *
 * @param withFilter boolean if filtering should be used
 */
const useClassList = (withFilter: boolean) => {
  const projectClass = useAppSelector(selectProject)?.projectClass;
  const masterClasses = useAppSelector(selectMasterClasses);
  const masterClassList = useAppSelector(selectMasterClassList);
  const classes = useAppSelector(selectClasses);
  const subClasses = useAppSelector(selectSubClasses);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (masterClassList.length === 0) {
      dispatch(setMasterClassList(masterClasses));
    }

    if (withFilter) {
      // The parents for each class/subClass should always be found, but typescript doesn't know that, so we
      // need to add ? (null/undefined checks to each filter)
      if (projectClass) {
        // If projectClass is a masterClass, we need to find all classes that have that masterClass as their parent
        const selectedMasterClass = masterClasses.find((mc) => mc.id === projectClass);
        if (selectedMasterClass) {
          dispatch(setClassList(classes.filter((c) => c.parent === projectClass)));
        }

        // If the projectClass is a class, we filter the lists to include every class that shares the same parent masterClass.
        const selectedClass = classes.find((c) => c.id === projectClass);
        if (selectedClass) {
          const classParent = masterClasses.find((mc) => mc.id === selectedClass.parent);
          dispatch(setClassList(classes.filter((c) => c.parent === classParent?.id)));
          dispatch(setSubClassList(subClasses.filter((sc) => sc.parent === projectClass)));
        }

        // If projectClass is a subClass, we filter the lists to include every class and subClass
        // that have the same parents
        const selectedSubClass = subClasses.find((sc) => sc.id === projectClass);
        if (selectedSubClass) {
          const subClassParent = classes.find((c) => c.id === selectedSubClass.parent);
          const classParent = masterClasses.find((mc) => mc.id === subClassParent?.parent);
          dispatch(setSubClassList(subClasses.filter((sc) => sc.parent === subClassParent?.id)));
          dispatch(setClassList(classes.filter((c) => c.parent === classParent?.id)));
        }
      }
    } else {
      dispatch(setClassList(classes));
      dispatch(setSubClassList(subClasses));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterClasses, projectClass, classes, subClasses, withFilter]);
};

export default useClassList;
