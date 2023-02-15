import { selectClasses, selectMasterClasses, selectSubClasses } from '@/reducers/classSlice';
import {
  selectMasterClassList,
  setClassList,
  setMasterClassList,
  setSubClassList,
} from '@/reducers/listsSlice';
import { selectProject } from '@/reducers/projectSlice';
import _ from 'lodash';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';

/**
 * Creates lists of masterClasses, classes and subClasses. If filtering is used, then all
 * classes and subClasses will be filtered according to their parent.
 *
 * @param withFilter boolean if filtering should be used
 */
const useClassList = (withFilter: boolean) => {
  const project = useAppSelector(selectProject, _.isEqual);
  const masterClasses = useAppSelector(selectMasterClasses, _.isEqual);
  const masterClassList = useAppSelector(selectMasterClassList, _.isEqual);
  const classes = useAppSelector(selectClasses, _.isEqual);
  const subClasses = useAppSelector(selectSubClasses, _.isEqual);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (masterClassList.length <= 0) {
      dispatch(setMasterClassList(masterClasses));
    }

    if (withFilter) {
      if (project?.projectClass) {
        /* If selected is a masterClass, we need to find all classes that have that masterClass as their parent */
        const selectedMasterClass = masterClasses.find((mc) => mc.id === project?.projectClass);
        if (selectedMasterClass) {
          dispatch(setClassList(classes.filter((c) => c.parent === project.projectClass)));
        }

        const selectedClass = classes.find((c) => c.id === project?.projectClass);
        /* If selected is a class, we need to find the master class and find all classes for that master class */
        if (selectedClass) {
          const masterClassForClass = masterClasses.find((mc) => mc.id === selectedClass.parent);

          dispatch(setClassList(classes.filter((c) => c.parent === masterClassForClass?.id)));
          dispatch(setSubClassList(subClasses.filter((sc) => sc.parent === project.projectClass)));
        }

        const selectedSubClass = subClasses.find((sc) => sc.id === project?.projectClass);
        /* If selected is a subClass, we need to find the class and masterClass and find which classes belong to that masterClass
            and which subClasses belong to that class */
        if (selectedSubClass) {
          const classForSubClass = classes.find((c) => c.id === selectedSubClass.parent);
          const masterClassForClass = masterClasses.find(
            (mc) => mc.id === classForSubClass?.parent,
          );

          dispatch(setSubClassList(subClasses.filter((sc) => sc.parent === classForSubClass?.id)));
          dispatch(setClassList(classes.filter((c) => c.parent === masterClassForClass?.id)));
        }
      }
    } else {
      dispatch(setClassList(classes));
      dispatch(setSubClassList(subClasses));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterClasses, project, classes, subClasses, withFilter]);
};

export default useClassList;
