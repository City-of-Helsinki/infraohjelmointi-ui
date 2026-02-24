import { authApi } from '@/api/authApi';
import { IError } from '@/interfaces/common';
import { IUser } from '@/interfaces/userInterfaces';
import { RootState } from '@/store';
import { getErrorFromRejectedAction } from '@/utils/reduxErrorUtils';
import { createSlice } from '@reduxjs/toolkit';

interface IUserState {
  user: IUser | null;
  error: IError | null | unknown;
}

const initialState: IUserState = {
  user: null,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.getUser.matchPending, (state) => {
        state.error = null;
      })
      .addMatcher(authApi.endpoints.getUser.matchFulfilled, (state, action) => {
        const userWithRoles = {
          ...action.payload,
          // ad_groups: [
          //   {
          //     id: '86b826df-589c-40f9-898f-1584e80b5482',
          //     name: 'sg_kymp_sso_io_koordinaattorit' as UserRole,
          //     display_name: 'sg_KYMP_sso_IO_Koordinaattorit',
          //   },
          //   {
          //     id: '31f86f09-b674-4c1d-81db-6d5fe2e587f9',
          //     name: 'sg_kymp_sso_io_projektipaallikot' as UserRole,
          //     display_name: 'sg_KYMP_sso_IO_Projektipaallikot',
          //   },
          //   {
          //     id: 'test-admin-role',
          //     name: 'sg_kymp_sso_io_admin' as UserRole,
          //     display_name: 'sg_KYMP_sso_IO_Admin',
          //   },
          //   {
          //     id: 'da48bfe9-6a99-481f-a252-077d31473c4c',
          //     name: 'sg_kymp_sso_io_ohjelmoijat' as UserRole,
          //     display_name: 'sg_KYMP_sso_IO_Ohjelmoijat',
          //   },
          //   {
          //     id: '4d229780-b511-4652-b32b-362ad88a7b55',
          //     name: 'sg_kymp_sso_io_projektialueiden_ohjelmoijat' as UserRole,
          //     display_name: 'sg_KYMP_sso_IO_Projektialueiden_ohjelmoijat',
          //   },
          //   {
          //     id: '31f86f09-b674-4c1d-81db-6d5fe2e587f9',
          //     name: 'sg_kymp_sso_io_projektipaallikot' as UserRole,
          //     display_name: 'sg_KYMP_sso_IO_Projektipaallikot',
          //   },
          //   {
          //     id: '7e39a13e-bd48-43ab-bd23-738e73b5137a',
          //     name: 'sl_dyn_kymp_sso_io_katselijat' as UserRole,
          //     display_name: 'sl_dyn_kymp_sso_io_katselijat',
          //   },
          //    {
          //      id: '61336d5e-4b74-400f-a1d6-c9f96d3f1d4d',
          //      name: 'sg_kymp_sso_io_katselijat_muut' as UserRole,
          //      display_name: 'sg_KYMP_sso_IO_Katselijat_Muut',
          //    },
          //    {
          //      id: '952da398-75b3-404a-b274-c8f351d7f5a7',
          //      name: 'az_kymp_asgd_u_infraohjelmointi_ulkopuoliset' as UserRole,
          //      display_name: 'az_KYMP_asgd_u_infraohjelmointi_ulkopuoliset',
          //    },
          // ],
        };
        state.user = userWithRoles;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.getUser.matchRejected, (state, action) => {
        state.user = null;
        state.error = getErrorFromRejectedAction(action);
      });
  },
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
