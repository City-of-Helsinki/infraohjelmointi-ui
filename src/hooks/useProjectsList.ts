import { IError } from '@/interfaces/common';
import { getProjectsThunk, selectCount, selectPage, selectProjects } from '@/reducers/projectSlice';
import { RootState } from '@/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from './common';

const useProjectsList = () => {
  const projectsFromRedux = useAppSelector(selectProjects);
  const projectsCount = useAppSelector(selectCount);
  const error = useAppSelector((state: RootState) => state.project.error) as IError;
  const page = useAppSelector(selectPage);
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
