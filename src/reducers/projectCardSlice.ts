import { IError } from '@/interfaces/common';
import {
  IProjectCard,
  IProjectCardRequestObject,
  IProjectCardsResponse,
} from '@/interfaces/projectCardInterfaces';
import {
  getProjectCard,
  getProjectCards,
  patchProjectCard,
  postProjectCard,
} from '@/services/projectCardServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notifySuccess } from './notificationSlice';

interface IProjectCardState {
  selectedProjectCard: IProjectCard | null;
  projectCards: Array<IProjectCard>;
  page: number;
  count: number;
  error: IError | null | unknown;
}

const initialState: IProjectCardState = {
  selectedProjectCard: null,
  projectCards: [],
  page: 1,
  count: 0,
  error: null,
};

export const getProjectCardsThunk = createAsyncThunk(
  'projectCard/getAll',
  async (page: number, thunkAPI) => {
    return await getProjectCards(page)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const getProjectCardThunk = createAsyncThunk(
  'projectCard/getOne',
  async (id: string, thunkAPI) => {
    return await getProjectCard(id)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const postProjectCardThunk = createAsyncThunk(
  'projectCard/post',
  async (request: IProjectCardRequestObject, thunkAPI) => {
    return await postProjectCard(request)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const patchProjectCardThunk = createAsyncThunk(
  'projectCard/patch',
  async (request: IProjectCardRequestObject, thunkAPI) => {
    return await patchProjectCard(request)
      .then((res) => {
        thunkAPI.dispatch(
          notifySuccess({
            title: 'sendSuccess',
            message: 'formSaveSuccess',
            type: 'toast',
          }),
        );
        return res;
      })
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const projectCardSlice = createSlice({
  name: 'projectCard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(
      getProjectCardsThunk.fulfilled,
      (state, action: PayloadAction<IProjectCardsResponse>) => {
        return {
          ...state,
          projectCards: [...state.projectCards, ...action.payload.results],
          count: action.payload.count,
        };
      },
    );
    builder.addCase(
      getProjectCardsThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // GET ONE
    builder.addCase(getProjectCardThunk.fulfilled, (state, action: PayloadAction<IProjectCard>) => {
      return { ...state, selectedProjectCard: action.payload };
    });
    builder.addCase(
      getProjectCardThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // POST
    builder.addCase(
      postProjectCardThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // PATCH
    builder.addCase(
      patchProjectCardThunk.fulfilled,
      (state, action: PayloadAction<IProjectCard>) => {
        return { ...state, selectedProjectCard: action.payload };
      },
    );
    builder.addCase(
      patchProjectCardThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
  },
});

export default projectCardSlice.reducer;
