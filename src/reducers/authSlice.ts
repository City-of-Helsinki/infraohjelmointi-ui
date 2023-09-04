import { IError } from '@/interfaces/common';
import { IPerson } from '@/interfaces/userInterfaces';
import { getPersons, getUser } from '@/services/personServices';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IUserState {
  user: IPerson | null;
  token: string | null;
  error: IError | null | unknown;
}

export const getPersonsThunk = createAsyncThunk('auth/getPersons', async (_, thunkAPI) => {
  return await getPersons()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const getUserThunk = createAsyncThunk('auth/getUsers', async (id: string, thunkAPI) => {
  return await getUser(id)
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

const initialState: IUserState = {
  user: null,
  token: null,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      return { ...state, token: action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserThunk.fulfilled, (state, action: PayloadAction<Array<IPerson>>) => {
      return { ...state, user: action.payload[0] };
    });
    builder.addCase(getUserThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;

export const { setToken } = authSlice.actions;

export default authSlice.reducer;
