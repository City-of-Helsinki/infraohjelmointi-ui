import { INote, INoteRequest, INoteImage } from '@/interfaces/noteInterfaces';
import { infraohjelmointiApi } from './infraohjelmointiApi';
import { notifyError, notifySuccess } from '@/reducers/notificationSlice';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

function getResolvedImageUrl(imageUrl: string): string {
  if (!API_BASE_URL) {
    return imageUrl;
  }

  try {
    return new URL(imageUrl, API_BASE_URL).toString();
  } catch {
    return imageUrl;
  }
}

async function getDownloadedImageUrl(image: INoteImage): Promise<string | undefined> {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return undefined;
  }

  try {
    const imageResponse = await axios.get<Blob>(getResolvedImageUrl(image.url), {
      responseType: 'blob',
    });
    return URL.createObjectURL(imageResponse.data);
  } catch {
    // Keep original url if image download fails.
    return undefined;
  }
}

async function hydrateNoteImages(note: INote): Promise<INote> {
  if (!note.images || note.images.length === 0) {
    return note;
  }

  const hydratedImages = await Promise.all(
    note.images.map(async (image) => ({
      ...image,
      downloadUrl: await getDownloadedImageUrl(image),
    })),
  );

  return {
    ...note,
    images: hydratedImages,
  };
}

function revokeDownloadedImageUrls(notes: INote[] | undefined) {
  if (!notes || typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') {
    return;
  }

  notes.forEach((note) => {
    note.images?.forEach((image) => {
      if (image.downloadUrl) {
        URL.revokeObjectURL(image.downloadUrl);
      }
    });
  });
}

export const notesApi = infraohjelmointiApi.injectEndpoints({
  endpoints: (build) => ({
    getNotesByProject: build.query<INote[], string>({
      async queryFn(projectId, _api, _extraOptions, baseQuery) {
        const notesResult = await baseQuery({
          url: `/projects/${projectId}/notes/`,
        });

        if (notesResult.error) {
          return { error: notesResult.error };
        }

        const notes = (notesResult.data as INote[]) ?? [];
        const hydratedNotes = await Promise.all(notes.map(hydrateNoteImages));

        return { data: hydratedNotes };
      },
      async onCacheEntryAdded(_arg, { cacheDataLoaded, cacheEntryRemoved, getCacheEntry }) {
        try {
          await cacheDataLoaded;
        } catch {
          return;
        }

        const notes = getCacheEntry().data;

        await cacheEntryRemoved;

        revokeDownloadedImageUrls(notes);
      },
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
      invalidatesTags: ['Notes'],
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
      invalidatesTags: ['Notes'],
    }),
  }),
});

export const {
  useGetNotesByProjectQuery,
  usePostNoteMutation,
  useDeleteNoteMutation,
  usePatchNoteMutation,
  usePostNoteImageMutation,
  useDeleteNoteImageMutation,
} = notesApi;
