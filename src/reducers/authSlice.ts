import { IError } from '@/interfaces/common';
import { IUser } from '@/interfaces/userInterfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IUserState {
  user: IUser | null;
  error: IError | null;
}

const initialState: IUserState = {
  user: null,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
