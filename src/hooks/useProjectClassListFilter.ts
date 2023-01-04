import { setClassList, setMasterClassList, setSubClassList } from '@/reducers/listsSlice';
import { RootState } from '@/store';
import _ from 'lodash';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './common';

const useProjectClassListFilter = () => {
  const project = useAppSelector((state: RootState) => state.project.selectedProject, _.isEqual);
  const masterClasses = useAppSelector((state: RootState) => state.class.masterClasses, _.isEqual);
  const masterClassList = useAppSelector((state: RootState) => state.lists.masterClass);
  const classes = useAppSelector((state: RootState) => state.class.classes, _.isEqual);
  const subClasses = useAppSelector((state: RootState) => state.class.subClasses, _.isEqual);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const selectedMasterClass = masterClasses.find((mc) => mc.id === project?.projectClass);
    const selectedClass = classes.find((c) => c.id === project?.projectClass);
    const selectedSubClass = subClasses.find((sc) => sc.id === project?.projectClass);

    if (masterClassList.length <= 0) {
      dispatch(setMasterClassList(masterClasses));
    }

    if (project?.projectClass) {
      /* If selected is a masterClass, we need to find all classes that have that masterClass as their parent */
      if (selectedMasterClass) {
        dispatch(setClassList(classes.filter((c) => c.parent === project?.projectClass)));
      }

      /* If selected is a class, we need to find the master class and find all classes for that master class */
      if (selectedClass) {
        const masterClassForClass = masterClasses.find((mc) => mc.id === selectedClass?.parent);

        dispatch(setClassList(classes.filter((c) => c.parent === masterClassForClass?.id)));
        dispatch(setSubClassList(subClasses.filter((sc) => sc.parent === project?.projectClass)));
      }

      /* If selected is a subClass, we need to find the class and masterClass and find which classes belong to that masterClass
          and which subClasses belong to that class */
      if (selectedSubClass) {
        const classForSubClass = classes.find((c) => c.id === selectedSubClass?.parent);
        const masterClassForClass = masterClasses.find((mc) => mc.id === classForSubClass?.parent);

        dispatch(setSubClassList(subClasses.filter((sc) => sc.parent === classForSubClass?.id)));
        dispatch(setClassList(classes.filter((c) => c.parent === masterClassForClass?.id)));
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterClasses, project, classes, subClasses]);
};

export default useProjectClassListFilter;
