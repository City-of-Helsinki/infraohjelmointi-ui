import { INote, INoteRequest, INoteImage } from '@/interfaces/noteInterfaces';
import { infraohjelmointiApi } from './infraohjelmointiApi';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';

export const notesApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getNotesByProject: build.query<INote[], string>({
      query: (projectId: string) => ({
        url: `/projects/${projectId}/notes/`,
      }),
      providesTags: ['Notes'],
    }),
    postNote: build.mutation<INote, INoteRequest>({
      query: (note: INoteRequest) => ({
        url: '/notes/',
        method: 'POST',
        data: note,
      }),
      invalidatesTags: ['Notes'],
    }),
    deleteNote: build.mutation<INote, string>({
      query: (id: string) => ({
        url: `/notes/${id}/`,
        method: 'DELETE',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            notifySuccess({
              title: 'deleteSuccess',
              message: 'noteDeleteSuccess',
              type: 'toast',
            }),
          );
        } catch {
          // Mutation failure is handled by rejected state in consumers.
        }
      },
      invalidatesTags: ['Notes'],
    }),
    patchNote: build.mutation<INote, Partial<INote>>({
      query: (note: Partial<INote>) => ({
        url: `/notes/${note.id}/`,
        method: 'PATCH',
        data: note,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            notifySuccess({
              title: 'patchSuccess',
              message: 'notePatchSuccess',
              type: 'toast',
            }),
          );
        } catch {
          // Mutation failure is handled by rejected state in consumers.
        }
      },
      invalidatesTags: ['Notes'],
    }),
    getNoteImages: build.query<INoteImage[], string>({
      query: (noteId) => ({
        url: `/notes/${noteId}/images/`,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          dispatch(
            notifyError({
              message: 'noteImageGetError',
              type: 'notification',
            }),
          );
        }
      },
      providesTags: (result, error, noteId) => [{ type: 'NoteImages', id: noteId }],
    }),
    postNoteImage: build.mutation<INoteImage[], { noteId: string; formData: FormData }>({
      query: ({ noteId, formData }) => ({
        url: `/notes/${noteId}/images/`,
        method: 'POST',
        data: formData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          dispatch(
            notifyError({
              title: 'saveError',
              message: 'noteImagePostError',
              type: 'toast',
              duration: 6000,
            }),
          );
        }
      },
      invalidatesTags: (result, error, { noteId }) => [{ type: 'NoteImages', id: noteId }],
    }),
    deleteNoteImage: build.mutation<undefined, { noteId: string; imageId: string }>({
      query: ({ noteId, imageId }) => ({
        url: `/notes/${noteId}/images/${imageId}/`,
        method: 'DELETE',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          dispatch(
            notifyError({
              title: 'deleteError',
              message: 'noteImageDeleteError',
              type: 'toast',
              duration: 6000,
            }),
          );
        }
      },
      invalidatesTags: (result, error, { noteId }) => [{ type: 'NoteImages', id: noteId }],
    }),
  }),
});

export const {
  useGetNotesByProjectQuery,
  usePostNoteMutation,
  useDeleteNoteMutation,
  usePatchNoteMutation,
  useGetNoteImagesQuery,
  usePostNoteImageMutation,
  useDeleteNoteImageMutation,
} = notesApi;
