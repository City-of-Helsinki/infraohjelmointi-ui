import { IError } from '@/interfaces/common';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IHashTagsResponse } from '@/interfaces/hashTagsInterfaces';
import { getHashTags } from '@/services/hashTagsService';
import { RootState } from '@/store';

interface IHashTagState extends IHashTagsResponse {
  error: IError | null | unknown;
}

const initialState: IHashTagState = {
  hashTags: [],
  popularHashTags: [],
  error: null,
};

export const getHashTagsThunk = createAsyncThunk('hashtag/getAll', async (_, thunkAPI) => {
  return await getHashTags()
    .then((res) => {
      return res;
    })
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const hashTagSlice = createSlice({
  name: 'hashTag',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(
      getHashTagsThunk.fulfilled,
      (state, action: PayloadAction<IHashTagsResponse>) => {
        return {
          ...state,
          hashTags: [...action.payload.hashTags],
          popularHashTags: [...action.payload.popularHashTags],
        };
      },
    );
    builder.addCase(getHashTagsThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const selectHashTags = (state: RootState) => state.hashTags;

export default hashTagSlice.reducer;
