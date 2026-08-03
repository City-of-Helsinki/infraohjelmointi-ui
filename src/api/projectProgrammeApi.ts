import { infraohjelmointiApi } from './infraohjelmointiApi';
import {
  IProjectProgramme,
  IProjectProgrammeBasicInfo,
} from '@/interfaces/projectProgrammeInterfaces';

export const projectProgrammeApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getProjectProgrammeByProject: build.query<IProjectProgramme, string>({
      query: (projectId: string) => ({
        url: `/project-programmes/by-project/${projectId}/`,
      }),
      providesTags: ['ProjectProgrammes'],
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
      invalidatesTags: ['ProjectProgrammes'],
    }),
    postSwitchProjectProgrammeType: build.mutation<IProjectProgramme, string>({
      query: (id: string) => ({
        url: `/project-programmes/${id}/switch-type/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ProjectProgrammes', id }],
    }),
    postProjectProgrammeBasicInfoSection: build.mutation<IProjectProgrammeBasicInfo, string>({
      query: (id: string) => ({
        url: `/project-programmes/${id}/sections/basic-info/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ProjectProgrammes', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProjectProgrammeByProjectQuery,
  useGetProjectProgrammeByIdQuery,
  usePostProjectProgrammeMutation,
  usePostSwitchProjectProgrammeTypeMutation,
  usePostProjectProgrammeBasicInfoSectionMutation,
} = projectProgrammeApi;
