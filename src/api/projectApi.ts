import {
  IProject,
  IProjectHistoryRequest,
  IProjectHistoryResponse,
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
    getProjectHistory: build.query<IProjectHistoryResponse, IProjectHistoryRequest>({
      query: ({ projectId, year, field, operation, page, pageSize }) => {
        const params = new URLSearchParams();
        if (year !== undefined && year !== null) params.append('year', String(year));
        if (field) params.append('field', field);
        if (operation) params.append('operation', operation);
        if (page) params.append('page', String(page));
        if (pageSize) params.append('page_size', String(pageSize));
        const queryString = params.toString();
        const suffix = queryString ? `?${queryString}` : '';
        return {
          url: `/projects/${projectId}/history/${suffix}`,
        };
      },
      // Tie the history cache to the project so editing it refetches the log.
      providesTags: (result, error, { projectId }) => [{ type: 'Projects', id: projectId }],
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
      invalidatesTags: (result, error, request) => [
        { type: 'Projects', id: request.id },
        'ProjectTasks',
      ],
    }),
    deleteProject: build.mutation<{ id: string }, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, projectId) => [
        { type: 'Projects', id: projectId },
        'ProjectTasks',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectByIdQuery,
  useLazyGetProjectByIdQuery,
  useGetProjectHistoryQuery,
  useLazyGetProjectHistoryQuery,
  usePostProjectMutation,
  usePatchProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
