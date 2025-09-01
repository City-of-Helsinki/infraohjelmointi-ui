import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IProgrammer } from '@/interfaces/programmerInterfaces';
import { getProgrammers } from '@/services/programmerServices';
import { RootState } from '@/store';

interface IProgrammerState {
  programmers: IProgrammer[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: IProgrammerState = {
  programmers: [],
  status: 'idle',
  error: null,
};

export const fetchProgrammers = createAsyncThunk('programmers/fetchProgrammers', async () => {
  const response = await getProgrammers();
  return response;
});

const programmerSlice = createSlice({
  name: 'programmers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgrammers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProgrammers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.programmers = action.payload;
      })
      .addCase(fetchProgrammers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const selectProgrammers = (state: RootState) => state.programmers.programmers;
export const selectProgrammersStatus = (state: RootState) => state.programmers.status;

export default programmerSlice.reducer;
