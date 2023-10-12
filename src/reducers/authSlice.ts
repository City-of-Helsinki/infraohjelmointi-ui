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
/*
const coordinator = {
  "id": "86b826df-589c-40f9-898f-1584e80b5482",
  "name": "sg_kymp_sso_io_koordinaattorit" as UserRole,
  "display_name": "sg_KYMP_sso_IO_Koordinaattorit",
}
const projectManager = {
  "id": '31f86f09-b674-4c1d-81db-6d5fe2e587f9',
  "name": 'sg_kymp_sso_io_projektipaallikot' as UserRole,
  "display_name": 'sg_KYMP_sso_IO_Projektipaallikot',
}*/
const admin = {
  "id": 'sg_kymp_sso_io_admin',
  "name": 'sg_kymp_sso_io_admin' as UserRole,
  "display_name": 'sg_KYMP_sso_IO_Admin',
}
const programmers = {
  "id": 'da48bfe9-6a99-481f-a252-077d31473c4c',
  "name": 'sg_kymp_sso_io_ohjelmoijat' as UserRole,
  "display_name": 'sg_KYMP_sso_IO_Ohjelmoijat',
}
/*const projectAreaProgrammers = {
  "id": '4d229780-b511-4652-b32b-362ad88a7b55',
  "name": 'sg_kymp_sso_io_projektialueiden_ohjelmoijat' as UserRole,
  "display_name": 'sg_KYMP_sso_IO_Projektialueiden_ohjelmoijat',
}
const viewers = {
  "id": '7e39a13e-bd48-43ab-bd23-738e73b5137a',
  "name": 'sl_dyn_kymp_sso_io_katselijat' as UserRole,
  "display_name": 'sl_dyn_kymp_sso_io_katselijat',
} */

const users = [
  {
    "id": "e0c8c3bd-ac21-48fe-849a-d23415a27c03",
    "role": "admin"
  },
  {
    "id": "b1700ee9-4e9a-4d27-b964-389bfc076d57",
    "role": "admin"
  },
  {
    "id": "b36bcad4-e705-4de7-baf2-ff8af0188af0",
    "role": "admin"
  },
  {
    "id": "28c46fc9-15bd-4727-8db1-9c8da67b97cb",
    "role": "admin"
  },
  {
    "id": "93476b18-3320-44e1-9a49-b8b7bf59a114",
    "role": "admin"
  },
  {
    "id": "d21f89b4-2c17-4ad0-956c-3e1e3cfb204f",
    "role": "admin"
  },
  {
    "id": "ca7a50c1-4d6a-4c74-bf6b-38584317e2a8",
    "role": "programmer"
  },
  {
    "id": "3eed85b4-7285-4d5f-a86a-94b0e777d9af",
    "role": "programmer"
  },
  {
    "id": "06d1ed99-617b-4ffc-9d91-25707a69f5f8",
    "role": "programmer"
  },
  {
    "id": "126ec360-1722-492b-9506-ef58548f1d43",
    "role": "programmer"
  },
  {
    "id": "210a5af6-957f-431f-b484-8e25e42140a8",
    "role": "programmer"
  },
  {
    "id": "6a6fd6ef-dcc6-42f2-93ac-26de4a49b3da",
    "role": "programmer"
  },
  {
    "id": "77484fbc-fc25-472c-adee-0e661141abd1",
    "role": "programmer"
  },
  {
    "id": "d1d8595c-2edf-42df-b1bf-43e758393e83",
    "role": "programmer"
  },
  {
    "id": "76e2bcbd-5a69-48da-8f0c-bb687d7b5c75",
    "role": "admin"
  },
  {
    "id": "30b7f70a-15db-45bb-b143-30ce59a1d6de",
    "role": "admin"
  },
  {
    "id": "5869874f-5fb5-4dea-ac7c-b3da45a1e6ee",
    "role": "admin"
  },
  {
    "id": "bf60ad56-75ef-4584-92ee-53623b1734d1",
    "role": "admin"
  },
  {
    "id": "ff2c6c27-a671-4502-a5c3-a4c221b62f0a",
    "role": "admin"
  },
  {
    "id": "d96f104c-6b59-43fb-ac6d-60fe5101973c",
    "role": "admin"
  },
  {
    "id": "2d92453f-bcbf-4e0e-93a5-55cfe8d73cf0",
    "role": "admin"
  }

]

const setHardCodedUserRoles = (payload: IUser) => {
  // Check if user is found from the list and then assign the correct role
  const user = users.find(user => user.id === payload.uuid);
  switch (user?.role) {
    case "admin":
      return {
        ...payload,
         ad_groups: [
          admin,
         ],
      };
    case "programmer":
      return {
        ...payload,
         ad_groups: [
          programmers,
         ],
      };
    default:
      return {
        ...payload,
          ad_groups: [],
      };
  }   
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUserThunk.fulfilled, (state, action: PayloadAction<IUser>) => {
      return { ...state, user: setHardCodedUserRoles(action.payload) };
    });
    builder.addCase(getUserThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const selectUser = (state: RootState) => state.auth.user;

export default authSlice.reducer;
