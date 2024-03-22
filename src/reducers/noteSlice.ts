import { IError } from '@/interfaces/common';
import { INote, INoteRequest } from '@/interfaces/noteInterfaces';
import { deleteNote, getNotesByProject, patchNote, postNote } from '@/services/noteServices';
import { RootState } from '@/store';
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
  'notes/getByProject',
  async (projectId: string, thunkAPI) => {
    try {
      const notes = await getNotesByProject(projectId);
      return notes;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const postNoteThunk = createAsyncThunk(
  'note/post',
  async (request: INoteRequest, thunkAPI) => {
    try {
      const note = await postNote(request);
      return note;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const deleteNoteThunk = createAsyncThunk('note/delete', async (request: INoteRequest, thunkAPI) => {
  try {
    const note = await deleteNote(request);

    thunkAPI.dispatch(
      notifySuccess({
        title: 'deleteSuccess',
        message: 'noteDeleteSuccess',
        type: 'toast',
      }),
    );

    return note;
  } catch (e) {
    return thunkAPI.rejectWithValue(e);
  }
});

export const patchNoteThunk = createAsyncThunk(
  'note/patch',
  async (request: INoteRequest, thunkAPI) => {
    try {
      const note = await patchNote(request);

      thunkAPI.dispatch(
        notifySuccess({
          title: 'patchSuccess',
          message: 'notePatchSuccess',
          type: 'toast',
        }),
      );

      return note;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
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

export const selectNotes = (state: RootState) => state.note.notes;

export default noteSlice.reducer;
