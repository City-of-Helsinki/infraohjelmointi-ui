import { IError } from '@/interfaces/common';
import { getProjectsThunk } from '@/reducers/projectSlice';
import { RootState } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from './common';
import _ from 'lodash';

const useProjectsList = () => {
  const projectsFromRedux = useAppSelector((state: RootState) => state.project.projects, _.isEqual);
  const projectsCount = useAppSelector((state: RootState) => state.project.count, _.isEqual);
  const error = useAppSelector((state: RootState) => state.project.error, _.isEqual) as IError;
  const page = useAppSelector((state: RootState) => state.project.page, _.isEqual);
  const [isLastProjectsFetched, setIsLastProjectsFetched] = useState(false);
  const [isFetchings, setIsFetchings] = useState(false);
  const dispatch = useAppDispatch();

  const fetchNext = () => {
    if (!isLastProjectsFetched && !isFetchings && !error?.message) {
      setIsFetchings(true);
      dispatch(getProjectsThunk(page + 1)).finally(() => setIsFetchings(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const projects = useMemo(() => projectsFromRedux, [projectsFromRedux]);

  // set isAllProjectsFetched preventing any further fetches
  useEffect(() => {
    setIsLastProjectsFetched(projectsCount !== null && projects.length >= projectsCount);
  }, [projects, projectsCount]);

  return { projects, fetchNext };
};

export default useProjectsList;
