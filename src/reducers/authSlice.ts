import { IError } from '@/interfaces/common';
import { IUser } from '@/interfaces/userInterfaces';
import { getUsers } from '@/services/userServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IUserState {
  user: IUser | null;
  error: IError | null | unknown;
}

export const getUsersThunk = createAsyncThunk('auth/getUsers', async (_, thunkAPI) => {
  return await getUsers()
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
    builder.addCase(getUsersThunk.fulfilled, (state, action: PayloadAction<Array<IUser>>) => {
      return { ...state, user: action.payload[0] };
    });
    builder.addCase(getUsersThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export default authSlice.reducer;
