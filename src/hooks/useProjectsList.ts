import { IError } from '@/interfaces/common';
import { getProjectsThunk, selectCount, selectPage, selectProjects } from '@/reducers/projectSlice';
import { RootState } from '@/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from './common';
import _ from 'lodash';

const useProjectsList = () => {
  const projectsFromRedux = useAppSelector(selectProjects, _.isEqual);
  const projectsCount = useAppSelector(selectCount, _.isEqual);
  const error = useAppSelector((state: RootState) => state.project.error, _.isEqual) as IError;
  const page = useAppSelector(selectPage, _.isEqual);
  const [isLastProjectsFetched, setIsLastProjectsFetched] = useState(false);
  const [isFetchings, setIsFetchings] = useState(false);
  const dispatch = useAppDispatch();

  const fetchNext = useCallback(() => {
    if (!isLastProjectsFetched && !isFetchings && !error?.message) {
      setIsFetchings(true);
      dispatch(getProjectsThunk(page + 1)).finally(() => setIsFetchings(false));
    }
  }, [dispatch, error?.message, isFetchings, isLastProjectsFetched, page]);

  const projects = useMemo(() => projectsFromRedux, [projectsFromRedux]);

  // set isAllProjectsFetched preventing any further fetches
  useEffect(() => {
    setIsLastProjectsFetched(projectsCount !== null && projects.length >= projectsCount);
  }, [projects, projectsCount]);

  return { projects, fetchNext };
};

export default useProjectsList;
