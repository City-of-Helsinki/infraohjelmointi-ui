import { IError } from '@/interfaces/common';
import { INote, INoteRequest } from '@/interfaces/noteInterfaces';
import { deleteNote, getNotesByProject, patchNote, postNote } from '@/services/noteServices';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notifySuccess } from './notificationSlice';

interface INotesState {
  notes: Array<INote>;
  error: IError | null | unknown;
}

const initialState: INotesState = {
  notes: [],
  error: null,
};

export const getNotesByProjectThunk = createAsyncThunk(
  'notesByProject/get',
  async (projectId: string, thunkAPI) => {
    return await getNotesByProject(projectId)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const postNoteThunk = createAsyncThunk(
  'note/post',
  async (request: INoteRequest, thunkAPI) => {
    return await postNote(request)
      .then((res) => res)
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const deleteNoteThunk = createAsyncThunk('note/delete', async (id: string, thunkAPI) => {
  return await deleteNote(id)
    .then((res) => {
      thunkAPI.dispatch(
        notifySuccess({
          title: 'deleteSuccess',
          message: 'noteDeleteSuccess',
          type: 'toast',
        }),
      );
      console.log('Response from THUNK: ', res);
      return res;
    })
    .catch((err: IError) => thunkAPI.rejectWithValue(err));
});

export const patchNoteThunk = createAsyncThunk(
  'note/patch',
  async (request: INoteRequest, thunkAPI) => {
    return await patchNote(request)
      .then((res) => {
        thunkAPI.dispatch(
          notifySuccess({
            title: 'patchSuccess',
            message: 'notePatchSuccess',
            type: 'toast',
          }),
        );
        return res;
      })
      .catch((err: IError) => thunkAPI.rejectWithValue(err));
  },
);

export const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // NOTES GET
    builder.addCase(
      getNotesByProjectThunk.fulfilled,
      (state, action: PayloadAction<Array<INote>>) => {
        return { ...state, notes: action.payload };
      },
    );
    builder.addCase(
      getNotesByProjectThunk.rejected,
      (state, action: PayloadAction<IError | unknown>) => {
        return { ...state, error: action.payload };
      },
    );
    // NOTE POST
    builder.addCase(postNoteThunk.fulfilled, (state, action: PayloadAction<INote>) => {
      return { ...state, notes: [...state.notes, action.payload] };
    });
    builder.addCase(postNoteThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
    // NOTE DELETE
    builder.addCase(deleteNoteThunk.fulfilled, (state, action: PayloadAction<INote>) => {
      return { ...state, notes: state.notes.filter((n) => n.id !== action.payload.id) };
    });
    builder.addCase(deleteNoteThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
    // NOTE PATCH
    builder.addCase(patchNoteThunk.fulfilled, (state, action: PayloadAction<INote>) => {
      // this will rearrange the notes, since we do not have a specific sort order yet (by date?)
      const notesWithoutPatchedNote = state.notes.filter((n) => n.id !== action.payload.id);
      return { ...state, notes: [...notesWithoutPatchedNote, action.payload] };
    });
    builder.addCase(patchNoteThunk.rejected, (state, action: PayloadAction<IError | unknown>) => {
      return { ...state, error: action.payload };
    });
  },
});

export default noteSlice.reducer;
