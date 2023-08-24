import { IError } from '@/interfaces/common';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IHashTag,
  IHashTagPatchRequest,
  IHashTagPostRequest,
  IHashTagsResponse,
} from '@/interfaces/hashTagsInterfaces';
import { getHashTags, patchHashTag, postHashTag } from '@/services/hashTagsService';
import { RootState } from '@/store';

interface IHashTagState extends IHashTagsResponse {
  error: unknown;
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

export const patchHashTagThunk = createAsyncThunk(
  'hashtag/patch',
  async (request: IHashTagPatchRequest, thunkAPI) => {
    return await patchHashTag(request)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const postHashTagThunk = createAsyncThunk(
  'hashtag/post',
  async (request: IHashTagPostRequest, thunkAPI) => {
    return await postHashTag(request)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const sortByHashtagName = (hashtags: Array<IHashTag>) =>
  [...hashtags].sort((a, b) => a.value.localeCompare(b.value, 'fi', { sensitivity: 'base' }));

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
          hashTags: sortByHashtagName([...action.payload.hashTags]),
          popularHashTags: sortByHashtagName([...action.payload.popularHashTags]),
        };
      },
    );
    builder.addCase(getHashTagsThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
    // PATCH ONE
    builder.addCase(patchHashTagThunk.fulfilled, (state, action: PayloadAction<IHashTag>) => {
      const hashTags = [...state.hashTags];
      const indexToUpdate = hashTags.findIndex((obj) => obj.id === action.payload.id);

      if (indexToUpdate !== -1) {
        hashTags[indexToUpdate] = action.payload;
      }

      return {
        ...state,
        hashTags,
      };
    });
    builder.addCase(patchHashTagThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
    // POST ONE
    builder.addCase(postHashTagThunk.fulfilled, (state, action: PayloadAction<IHashTag>) => {
      return {
        ...state,
        hashTags: sortByHashtagName([...state.hashTags, action.payload]),
      };
    });
    builder.addCase(postHashTagThunk.rejected, (state, action: PayloadAction<unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export const selectHashTags = (state: RootState) => state.hashTags;
export const selectAllHashtags = (state: RootState) => state.hashTags.hashTags;

export default hashTagSlice.reducer;
