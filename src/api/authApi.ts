import { IUser } from '@/interfaces/userInterfaces';
import { infraohjelmointiApi } from './infraohjelmointiApi';

export const authApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getUser: build.query<IUser, void>({
      query: () => ({
        url: '/who-am-i/',
      }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetUserQuery, useLazyGetUserQuery } = authApi;
