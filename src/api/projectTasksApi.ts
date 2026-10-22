import { infraohjelmointiApi } from './infraohjelmointiApi';
import type { IProjectTask } from '@/interfaces/projectInterfaces';

export const projectTasksApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getProjectTasks: build.query<IProjectTask[], void>({
      query: () => ({ url: '/project-tasks' }),
      providesTags: ['ProjectTasks'],
    }),
  }),
});

export const { useGetProjectTasksQuery } = projectTasksApi;
