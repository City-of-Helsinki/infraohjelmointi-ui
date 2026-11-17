import { infraohjelmointiApi } from './infraohjelmointiApi';
import {
  ITalpaAssetClass,
  ITalpaProjectOpening,
  ITalpaProjectPatchRequestObject,
  ITalpaProjectPostRequestObject,
  ITalpaProjectRange,
  ITalpaProjectType,
  ITalpaServiceClass,
} from '@/interfaces/talpaInterfaces';
import { notifySuccess } from '@/reducers/notificationSlice';

export const talpaApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getTalpaProjectOpeningByProject: build.query<ITalpaProjectOpening | null, string>({
      async queryFn(projectId, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: `/talpa-project-opening/by-project/${projectId}/`,
        });

        if (result.error) {
          // A project without a Talpa project opening yet responds with 404
          if ((result.error as { status?: number }).status === 404) {
            return { data: null };
          }
          return { error: result.error };
        }

        return { data: result.data as ITalpaProjectOpening };
      },
      providesTags: (_result, _error, projectId) => [
        { type: 'TalpaProjectOpening', id: projectId },
      ],
    }),
    postTalpaProjectOpening: build.mutation<ITalpaProjectOpening, ITalpaProjectPostRequestObject>({
      query: (request) => ({
        url: '/talpa-project-opening/',
        method: 'POST',
        data: request.data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            notifySuccess({
              title: 'saveSuccess',
              message: 'talpaProjectPostSuccess',
              type: 'toast',
            }),
          );
        } catch (error) {
          console.error('Error posting Talpa project opening: ', error);
        }
      },
      invalidatesTags: (_result, _error, request) => [
        { type: 'TalpaProjectOpening', id: request.data.project },
      ],
    }),
    patchTalpaProjectOpening: build.mutation<ITalpaProjectOpening, ITalpaProjectPatchRequestObject>(
      {
        query: (request) => ({
          url: `/talpa-project-opening/${request.id}/`,
          method: 'PATCH',
          data: request.data,
        }),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(
              notifySuccess({
                title: 'patchSuccess',
                message: 'talpaProjectPatchSuccess',
                type: 'toast',
              }),
            );
          } catch (error) {
            console.error('Error patching Talpa project opening: ', error);
          }
        },
        invalidatesTags: (_result, _error, request) => [
          { type: 'TalpaProjectOpening', id: request.data.project },
        ],
      },
    ),
    markTalpaProjectAsSent: build.mutation<ITalpaProjectOpening, string>({
      query: (talpaProjectId) => ({
        url: `/talpa-project-opening/${talpaProjectId}/send-to-talpa/`,
        method: 'POST',
      }),
      invalidatesTags: (result) =>
        result ? [{ type: 'TalpaProjectOpening', id: result.project }] : [],
    }),
    getTalpaProjectRanges: build.query<ITalpaProjectRange[], void>({
      query: () => ({ url: '/talpa-project-ranges/' }),
    }),
    getTalpaProjectTypes: build.query<ITalpaProjectType[], void>({
      query: () => ({ url: '/talpa-project-types/' }),
    }),
    getTalpaServiceClasses: build.query<ITalpaServiceClass[], void>({
      query: () => ({ url: '/talpa-service-classes/' }),
    }),
    getTalpaAssetClasses: build.query<ITalpaAssetClass[], void>({
      query: () => ({ url: '/talpa-asset-classes/' }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTalpaProjectOpeningByProjectQuery,
  usePostTalpaProjectOpeningMutation,
  usePatchTalpaProjectOpeningMutation,
  useMarkTalpaProjectAsSentMutation,
  useGetTalpaProjectRangesQuery,
  useGetTalpaProjectTypesQuery,
  useGetTalpaServiceClassesQuery,
  useGetTalpaAssetClassesQuery,
} = talpaApi;
