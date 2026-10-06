import axios from 'axios';
import { infraohjelmointiApi } from './infraohjelmointiApi';
import {
  IProjectProgramme,
  IProjectProgrammeAttachment,
  IProjectProgrammeSectionTransitionResponse,
  IProjectProgrammeTransitionResponse,
  ProjectProgrammeStatus,
} from '@/interfaces/projectProgrammeInterfaces';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const getOtherAttachmentsUrl = (id: string) =>
  `/project-programmes/${id}/sections/other-attachments/attachments/`;

export async function getProjectProgrammeAttachmentBlob(
  projectProgrammeId: string,
  attachmentId: string,
): Promise<Blob> {
  const response = await axios.get<Blob>(
    `${API_BASE_URL}${getOtherAttachmentsUrl(projectProgrammeId)}${attachmentId}/download/`,
    { responseType: 'blob' },
  );
  return response.data;
}

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
      invalidatesTags: (result, error, id) => [{ type: 'ProjectProgrammes', id }],
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
      invalidatesTags: (result, error, arg) => [{ type: 'ProjectProgrammes', id: arg.id }],
    }),
    transitionProjectProgrammeSectionStatus: build.mutation<
      IProjectProgrammeSectionTransitionResponse,
      { id: string; section: string; to: ProjectProgrammeStatus }
    >({
      query: ({ id, section, to }) => ({
        url: `/project-programmes/${id}/sections/${section}/transitions/`,
        method: 'POST',
        data: { to },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'ProjectProgrammes', id: arg.id }],
    }),
    postProjectProgrammeSection: build.mutation<
      Record<string, unknown>,
      {
        id: string;
        section: string;
        data?: Record<string, unknown>;
      }
    >({
      query: ({
        id,
        section,
        data,
      }: {
        id: string;
        section: string;
        data?: Record<string, unknown>;
      }) => ({
        url: `/project-programmes/${id}/sections/${section}/`,
        method: 'POST',
        data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'ProjectProgrammes', id: arg.id }],
    }),
    patchProjectProgrammeSection: build.mutation<
      Record<string, unknown>,
      {
        id: string;
        section: string;
        data: Record<string, unknown>;
      }
    >({
      query: ({
        id,
        section,
        data,
      }: {
        id: string;
        section: string;
        data: Record<string, unknown>;
      }) => ({
        url: `/project-programmes/${id}/sections/${section}/`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'ProjectProgrammes', id: arg.id }],
    }),
    postProjectProgrammeAttachments: build.mutation<
      IProjectProgrammeAttachment[],
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: getOtherAttachmentsUrl(id),
        method: 'POST',
        data: formData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'ProjectProgrammes', id: arg.id }],
    }),
    deleteProjectProgrammeAttachment: build.mutation<
      undefined,
      { id: string; attachmentId: string }
    >({
      query: ({ id, attachmentId }) => ({
        url: `${getOtherAttachmentsUrl(id)}${attachmentId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'ProjectProgrammes', id: arg.id }],
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
  useTransitionProjectProgrammeSectionStatusMutation,
  usePostProjectProgrammeSectionMutation,
  usePatchProjectProgrammeSectionMutation,
  usePostProjectProgrammeAttachmentsMutation,
  useDeleteProjectProgrammeAttachmentMutation,
} = projectProgrammeApi;
