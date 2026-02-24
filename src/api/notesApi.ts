import { INote, INoteRequest } from '@/interfaces/noteInterfaces';
import { infraohjelmointiApi } from './infraohjelmointiApi';
import { notifySuccess } from '@/reducers/notificationSlice';

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
        } catch (error) {
          console.error('Error deleting note: ', error);
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
        } catch (error) {
          console.error('Error patching note: ', error);
        }
      },
      invalidatesTags: ['Notes'],
    }),
  }),
});

export const {
  useGetNotesByProjectQuery,
  usePostNoteMutation,
  useDeleteNoteMutation,
  usePatchNoteMutation,
} = notesApi;
