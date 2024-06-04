import { IError } from '@/interfaces/common';
import { IUser, UserRole } from '@/interfaces/userInterfaces';
import { getUser } from '@/services/userServices';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IUserState {
  user: IUser | null;
  error: IError | null | unknown;
}

export const getUserThunk = createAsyncThunk('auth/getUsers', async (_, thunkAPI) => {
  try {
    const user = await getUser();
    return user;
  } catch (e) {
    return thunkAPI.rejectWithValue(e);
  }
});

const initialState: IUserState = {
  user: null,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUserThunk.fulfilled, (state, action: PayloadAction<IUser>) => {
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
        //    }
        // ],
      };

      return { ...state, user: userWithRoles };
    });
    builder.addCase(getUserThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
