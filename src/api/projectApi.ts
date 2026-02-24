import { IProject } from '@/interfaces/projectInterfaces';
import { infraohjelmointiApi } from './infraohjelmointiApi';

export const projectApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getProjectById: build.query<IProject, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/`,
      }),
      providesTags: (result, error, projectId) => [{ type: 'Projects', id: projectId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProjectByIdQuery, useLazyGetProjectByIdQuery } = projectApi;
