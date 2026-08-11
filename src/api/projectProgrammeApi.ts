import { infraohjelmointiApi } from './infraohjelmointiApi';
import {
  IProjectProgramme,
  IProjectProgrammeTransitionResponse,
  ProjectProgrammeStatus,
} from '@/interfaces/projectProgrammeInterfaces';

export const projectProgrammeApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getProjectProgrammeByProject: build.query<IProjectProgramme, string>({
      query: (projectId: string) => ({
        url: `/project-programmes/by-project/${projectId}/`,
      }),
      providesTags: (result) =>
        result
          ? [{ type: 'ProjectProgrammes', id: result.id }, { type: 'ProjectProgrammes' }]
          : [{ type: 'ProjectProgrammes' }],
    }),
    getProjectProgrammeById: build.query<IProjectProgramme, string>({
      query: (id: string) => ({
        url: `/project-programmes/${id}/`,
      }),
      providesTags: (result, error, id) => [{ type: 'ProjectProgrammes', id }],
    }),
    postProjectProgramme: build.mutation<IProjectProgramme, { project: string }>({
      query: (request: { project: string }) => ({
        url: '/project-programmes/',
        method: 'POST',
        data: request,
      }),
      invalidatesTags: [{ type: 'ProjectProgrammes' }],
    }),
    postSwitchProjectProgrammeType: build.mutation<IProjectProgramme, string>({
      query: (id: string) => ({
        url: `/project-programmes/${id}/switch-type/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ProjectProgrammes', id },
        { type: 'ProjectProgrammes' },
      ],
    }),
    transitionProjectProgrammeStatus: build.mutation<
      IProjectProgrammeTransitionResponse,
      { id: string; to: ProjectProgrammeStatus }
    >({
      query: ({ id, to }: { id: string; to: ProjectProgrammeStatus }) => ({
        url: `/project-programmes/${id}/transitions/`,
        method: 'POST',
        data: { to },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'ProjectProgrammes', id: arg.id },
        { type: 'ProjectProgrammes' },
      ],
    }),
    postProjectProgrammeSection: build.mutation<
      Record<string, unknown>,
      {
        id: string;
        section: string;
        data?: Record<string, unknown>;
      }
    >({
      query: ({ id, section, data }: {
        id: string;
        section: string;
        data?: Record<string, unknown>;
      }) => ({
        url: `/project-programmes/${id}/sections/${section}/`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'ProjectProgrammes', id: arg.id },
        { type: 'ProjectProgrammes' },
      ],
    }),
    patchProjectProgrammeSection: build.mutation<
      Record<string, unknown>,
      {
        id: string;
        section: string;
        data: Record<string, unknown>;
      }
    >({
      query: ({ id, section, data }: {
        id: string;
        section: string;
        data: Record<string, unknown>;
      }) => ({
        url: `/project-programmes/${id}/sections/${section}/`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'ProjectProgrammes', id: arg.id },
        { type: 'ProjectProgrammes' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectProgrammeByProjectQuery,
  useGetProjectProgrammeByIdQuery,
  usePostProjectProgrammeMutation,
  usePostSwitchProjectProgrammeTypeMutation,
  useTransitionProjectProgrammeStatusMutation,
  usePostProjectProgrammeSectionMutation,
  usePatchProjectProgrammeSectionMutation,
} = projectProgrammeApi;
