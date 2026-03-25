import { useParams } from 'react-router';
import { useAppSelector } from './common';
import { selectUser } from '@/reducers/authSlice';
import { selectProjectMode } from '@/reducers/projectSlice';
import { useGetProjectByIdQuery } from '@/api/projectApi';
import { skipToken } from '@reduxjs/toolkit/query';

export default function useGetProject() {
  const { projectId } = useParams<{ projectId: string }>();
  const user = useAppSelector(selectUser);
  const projectMode = useAppSelector(selectProjectMode);
  const shouldFetchProject = Boolean(projectId && user && projectMode !== 'new');

  const result = useGetProjectByIdQuery(shouldFetchProject && projectId ? projectId : skipToken);

  return {
    ...result,
    shouldFetchProject,
  };
}
