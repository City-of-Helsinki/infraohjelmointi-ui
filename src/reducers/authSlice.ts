import { IError } from '@/interfaces/common';
import { IPerson } from '@/interfaces/userInterfaces';
import { getPersons } from '@/services/personServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IUserState {
  user: IPerson | null;
  error: IError | null | unknown;
}

export const getUserThunk = createAsyncThunk('auth/getUsers', async (_, thunkAPI) => {
  return await getPersons()
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
    builder.addCase(getUserThunk.fulfilled, (state, action: PayloadAction<Array<IPerson>>) => {
      return { ...state, user: action.payload[0] };
    });
    builder.addCase(getUserThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export default authSlice.reducer;
