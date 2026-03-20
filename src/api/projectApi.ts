import {
  IProject,
  IProjectPatchRequestObject,
  IProjectPostRequestObject,
} from '@/interfaces/projectInterfaces';
import { infraohjelmointiApi } from './infraohjelmointiApi';

export const projectApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getProjectById: build.query<IProject, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/`,
      }),
      providesTags: (result, error, projectId) => [{ type: 'Projects', id: projectId }],
    }),
    postProject: build.mutation<IProject, IProjectPostRequestObject>({
      query: (request) => ({
        url: '/projects/',
        method: 'POST',
        data: request.data,
      }),
    }),
    patchProject: build.mutation<IProject, IProjectPatchRequestObject>({
      query: (request) => ({
        url: `/projects/${request.id}/`,
        method: 'PATCH',
        data: request.data,
      }),
      invalidatesTags: (result, error, request) => [{ type: 'Projects', id: request.id }],
    }),
    deleteProject: build.mutation<{ id: string }, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, projectId) => [{ type: 'Projects', id: projectId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectByIdQuery,
  useLazyGetProjectByIdQuery,
  usePostProjectMutation,
  usePatchProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
