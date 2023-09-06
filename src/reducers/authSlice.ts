import { IError } from '@/interfaces/common';
import { IUser } from '@/interfaces/userInterfaces';
import { getUser } from '@/services/userServices';
import { RootState } from '@/store';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IUserState {
  user: IUser | null;
  error: IError | null | unknown;
}

export const getUserThunk = createAsyncThunk('auth/getUsers', async (_, thunkAPI) => {
  return await getUser()
    .then((res) => res)
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
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
      return { ...state, user: action.payload };
    });
    builder.addCase(getUserThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const selectUser = (state: RootState) => state.auth.user;

export default authSlice.reducer;
