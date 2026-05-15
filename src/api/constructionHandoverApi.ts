import { infraohjelmointiApi } from './infraohjelmointiApi';
import {
  IConstructionHandover,
  IConstructionHandoverPatchRequest,
} from '@/interfaces/constructionHandoverInterfaces';
import { notifySuccess } from '@/reducers/notificationSlice';

export const constructionHandoverApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getConstructionHandoversByProject: build.query<IConstructionHandover[], string>({
      query: (projectId: string) => ({
        url: `/projects/${projectId}/construction-handovers/`,
      }),
      providesTags: ['ConstructionHandovers'],
    }),
    postConstructionHandover: build.mutation<IConstructionHandover, { project: string | null }>({
      query: (handover: { project: string | null }) => ({
        url: '/construction-handovers/',
        method: 'POST',
        data: handover,
      }),
      invalidatesTags: ['ConstructionHandovers'],
    }),
    patchConstructionHandover: build.mutation<
      IConstructionHandover,
      IConstructionHandoverPatchRequest
    >({
      query: (request: IConstructionHandoverPatchRequest) => ({
        url: `/construction-handovers/${request.id}/`,
        method: 'PATCH',
        data: request.data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            notifySuccess({
              title: 'patchSuccess',
              message: 'constructionHandoverPatchSuccess',
              type: 'toast',
            }),
          );
        } catch (error) {
          console.error('Error patching construction handover: ', error);
        }
      },
      invalidatesTags: ['ConstructionHandovers'],
    }),
    deleteConstructionHandover: build.mutation<{ success: boolean }, string>({
      query: (id: string) => ({
        url: `/construction-handovers/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ConstructionHandovers'],
    }),
  }),
});

export const {
  useGetConstructionHandoversByProjectQuery,
  usePostConstructionHandoverMutation,
  usePatchConstructionHandoverMutation,
  useDeleteConstructionHandoverMutation,
} = constructionHandoverApi;
