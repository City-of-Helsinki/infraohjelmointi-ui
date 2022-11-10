import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ITestState {
  message: string;
}

const initialState: ITestState = {
  message: 'Hello World',
};

/**
 * TODO: Remove later, this is just a test slice
 */
export const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    oldMessage: (state) => {
      state.message = initialState.message;
    },
    newMessage: (state) => {
      state.message = 'Hello Infraohjelmointi';
    },
    customMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
  },
});

export const { oldMessage, newMessage, customMessage } = testSlice.actions;

export default testSlice.reducer;
