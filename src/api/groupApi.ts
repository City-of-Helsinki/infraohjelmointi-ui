import { ICoordinatorRequestParams } from '@/interfaces/common';
import { IGroup, IGroupPatchRequestObject, IGroupRequest } from '@/interfaces/groupInterfaces';
import { infraohjelmointiApi } from './infraohjelmointiApi';

export const groupApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getPlanningGroups: build.query<IGroup[], number>({
      query: (year) => ({
        url: `/project-groups/?year=${year}`,
      }),
      providesTags: ['Groups'],
    }),
    getCoordinationGroups: build.query<IGroup[], ICoordinatorRequestParams>({
      query: ({ forcedToFrame, year }) => ({
        url: `/project-groups/coordinator/?year=${year}&forcedToFrame=${forcedToFrame}`,
      }),
      providesTags: ['Groups'],
    }),
    postGroup: build.mutation<IGroup, IGroupRequest>({
      query: (data) => ({
        url: '/project-groups/',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Groups'],
    }),
    patchGroup: build.mutation<IGroup, IGroupPatchRequestObject>({
      query: ({ id, data }) => ({
        url: `/project-groups/${id}/`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Groups'],
    }),
    deleteGroup: build.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/project-groups/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Groups'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPlanningGroupsQuery,
  useLazyGetPlanningGroupsQuery,
  useGetCoordinationGroupsQuery,
  useLazyGetCoordinationGroupsQuery,
  usePostGroupMutation,
  usePatchGroupMutation,
  useDeleteGroupMutation,
} = groupApi;
