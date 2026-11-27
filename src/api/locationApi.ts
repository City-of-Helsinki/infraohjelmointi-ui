import { IClassPatchRequest } from '@/interfaces/classInterfaces';
import { ICoordinatorRequestParams } from '@/interfaces/common';
import { ILocation } from '@/interfaces/locationInterfaces';
import { infraohjelmointiApi } from './infraohjelmointiApi';

export const locationApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getPlanningLocations: build.query<ILocation[], number>({
      query: (year) => ({
        url: `/project-locations/?year=${year}`,
      }),
      providesTags: ['Locations'],
    }),
    getCoordinationLocations: build.query<ILocation[], ICoordinatorRequestParams>({
      query: ({ forcedToFrame, year }) => ({
        url: `/project-locations/coordinator/?forcedToFrame=${forcedToFrame}&year=${year}`,
      }),
      providesTags: ['Locations'],
    }),
    patchCoordinationLocation: build.mutation<ILocation, IClassPatchRequest>({
      query: ({ id, data }) => ({
        url: `/project-locations/coordinator/${id}/`,
        method: 'PATCH',
        data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPlanningLocationsQuery,
  useLazyGetPlanningLocationsQuery,
  useGetCoordinationLocationsQuery,
  useLazyGetCoordinationLocationsQuery,
  usePatchCoordinationLocationMutation,
} = locationApi;
