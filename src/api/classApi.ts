import { IClass, IClassPatchRequest } from '@/interfaces/classInterfaces';
import { ICoordinatorRequestParams } from '@/interfaces/common';
import { infraohjelmointiApi } from './infraohjelmointiApi';

export const classApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getPlanningClasses: build.query<IClass[], number>({
      query: (year) => ({
        url: `/project-classes/?year=${year}`,
      }),
      providesTags: ['Classes'],
    }),
    getCoordinationClasses: build.query<IClass[], ICoordinatorRequestParams>({
      query: ({ forcedToFrame, year }) => ({
        url: `/project-classes/coordinator/?forcedToFrame=${forcedToFrame}&year=${year}`,
      }),
      providesTags: ['Classes'],
    }),
    patchCoordinationClass: build.mutation<IClass, IClassPatchRequest>({
      query: ({ id, data }) => ({
        url: `/project-classes/coordinator/${id}/`,
        method: 'PATCH',
        data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPlanningClassesQuery,
  useLazyGetPlanningClassesQuery,
  useGetCoordinationClassesQuery,
  useLazyGetCoordinationClassesQuery,
  usePatchCoordinationClassMutation,
} = classApi;
