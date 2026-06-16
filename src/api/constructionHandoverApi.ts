import { infraohjelmointiApi } from './infraohjelmointiApi';
import {
  ConstructionHandoverStatus,
  FinancingRowRequest,
  IConstructionHandover,
  IConstructionHandoverFinancing,
  IConstructionHandoverPatchRequest,
  IConstructionHandoverTransitionResponse,
} from '@/interfaces/constructionHandoverInterfaces';
import { notifySuccess } from '@/reducers/notificationSlice';
import { t } from 'i18next';

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
    postConstructionHandoverFinancing: build.mutation<
      IConstructionHandoverFinancing,
      FinancingRowRequest
    >({
      query: (request: FinancingRowRequest) => ({
        url: '/construction-handover-financings/',
        method: 'POST',
        data: request,
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
    patchConstructionHandoverFinancing: build.mutation<
      IConstructionHandoverFinancing,
      { id: string; request: FinancingRowRequest }
    >({
      query: ({ id, request }: { id: string; request: FinancingRowRequest }) => ({
        url: `/construction-handover-financings/${id}/`,
        method: 'PATCH',
        data: request,
      }),
      invalidatesTags: ['ConstructionHandovers'],
    }),
    deleteConstructionHandover: build.mutation<{ success: boolean }, string>({
      query: (id: string) => ({
        url: `/construction-handovers/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ConstructionHandovers'],
    }),
    transitionConstructionHandoverStatus: build.mutation<
      IConstructionHandoverTransitionResponse,
      { id: string; to: ConstructionHandoverStatus }
    >({
      query: ({ id, to }) => ({
        url: `/construction-handovers/${id}/transitions/`,
        method: 'POST',
        data: { to },
      }),
      async onQueryStarted({ to }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            notifySuccess({
              title: 'statusTransitionSuccess',
              message: 'constructionHandoverStatusTransitionSuccess',
              parameter: t(`constructionHandoverForm.toStatus.${to}`),
              type: 'toast',
            }),
          );
        } catch (error) {
          console.error('Error transitioning construction handover status: ', error);
        }
      },
      invalidatesTags: ['ConstructionHandovers'],
    }),
    deleteConstructionHandoverFinancing: build.mutation<void, string>({
      query: (id: string) => ({
        url: `/construction-handover-financings/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ConstructionHandovers'],
    }),
  }),
});

export const {
  useGetConstructionHandoversByProjectQuery,
  usePostConstructionHandoverMutation,
  usePostConstructionHandoverFinancingMutation,
  usePatchConstructionHandoverMutation,
  usePatchConstructionHandoverFinancingMutation,
  useDeleteConstructionHandoverMutation,
  useTransitionConstructionHandoverStatusMutation,
  useDeleteConstructionHandoverFinancingMutation,
} = constructionHandoverApi;
