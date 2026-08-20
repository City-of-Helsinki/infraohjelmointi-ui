import mockI18next from '@/mocks/mockI18next';
import mockProject from '@/mocks/mockProject';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectNotes from './ProjectNotes';
import mockNotes from '@/mocks/mockNotes';
import { INote, INoteImage } from '@/interfaces/noteInterfaces';
import { act, waitFor, within } from '@testing-library/react';
import { stringToDateTime } from '@/utils/dates';
import { Route } from 'react-router';
import { useEffect, useState } from 'react';
import mockNoteImages from '@/mocks/mockNoteImages';

jest.mock('react-i18next', () => mockI18next());

const mockUseGetNotesByProjectQuery = jest.fn();
const mockUseGetNoteImagesQuery = jest.fn();
const mockPostNoteTrigger = jest.fn();
const mockDeleteNoteTrigger = jest.fn();
const mockPatchNoteTrigger = jest.fn();
const mockPostNoteImageTrigger = jest.fn();
const mockDeleteNoteImageTrigger = jest.fn();
const mockIsConfirmed = jest.fn();

let mockNotesState: INote[] = [];
const mockNotesSubscribers = new Set<(notes: INote[]) => void>();

let mockNoteImagesByNoteId: Record<string, INoteImage[]> = {};

const setMockNotesState = (notes: INote[]) => {
  mockNotesState = notes;
  mockNotesSubscribers.forEach((subscriber) => subscriber(mockNotesState));
};

const appendMockNote = (note: INote) => setMockNotesState([...mockNotesState, note]);

const removeMockNote = (noteId: string) =>
  setMockNotesState(mockNotesState.filter((note) => note.id !== noteId));

const updateMockNote = (id: string, content: string) =>
  setMockNotesState(mockNotesState.map((note) => (note.id === id ? { ...note, content } : note)));

const useMockedNotesQuery = () => {
  const [data, setData] = useState<INote[]>(mockNotesState);

  useEffect(() => {
    setData(mockNotesState);

    const subscriber = (nextNotes: INote[]) => setData([...nextNotes]);
    mockNotesSubscribers.add(subscriber);

    return () => {
      mockNotesSubscribers.delete(subscriber);
    };
  }, []);

  return { data };
};

jest.mock('@/api/notesApi', () => {
  const originalModule = jest.requireActual('@/api/notesApi');
  return {
    ...originalModule,
    useGetNotesByProjectQuery: (...args: unknown[]) => mockUseGetNotesByProjectQuery(...args),
    useGetNoteImagesQuery: (...args: unknown[]) => mockUseGetNoteImagesQuery(...args),
    usePostNoteMutation: () => [mockPostNoteTrigger, { isLoading: false }],
    useDeleteNoteMutation: () => [mockDeleteNoteTrigger, { isLoading: false }],
    usePatchNoteMutation: () => [mockPatchNoteTrigger, { isLoading: false }],
    usePostNoteImageMutation: () => [mockPostNoteImageTrigger, { isLoading: false }],
    useDeleteNoteImageMutation: () => [mockDeleteNoteImageTrigger, { isLoading: false }],
  };
});

jest.mock('@/hooks/useConfirmDialog', () => ({
  __esModule: true,
  default: () => ({
    isConfirmed: mockIsConfirmed,
  }),
}));

const createProjectState = () => ({
  count: 1,
  error: null,
  page: 1,
  isSaving: false,
  mode: 'edit' as const,
});

const getPreloadedState = () => ({
  project: createProjectState(),
});

const render = async () =>
  await act(async () =>
    renderWithProviders(
      <Route path="/project/:projectId/notes" element={<ProjectNotes />} />,
      {
        preloadedState: getPreloadedState(),
      },
      { route: `/project/${mockProject.data.id}/notes` },
    ),
  );

const renderWithNotesLoaded = async () => {
  const utils = await render();
  await waitFor(() =>
    expect(utils.queryAllByTestId('note-container').length).toBe(mockNotes.data.length),
  );
  return utils;
};

describe('ProjectNotes', () => {
  beforeEach(() => {
    mockNotesState = [...mockNotes.data];
    mockNoteImagesByNoteId = {};

    mockUseGetNotesByProjectQuery.mockImplementation(() => useMockedNotesQuery());
    mockUseGetNoteImagesQuery.mockImplementation((noteId: string) => ({
      data: mockNoteImagesByNoteId[noteId] ?? [],
    }));

    mockPostNoteTrigger.mockImplementation((noteRequest: Partial<INote>) => ({
      unwrap: async () => {
        const newNote: INote = {
          ...(mockNotes.data[1] as INote),
          id: '9bddd912-fe41-4e01-82a5-cca4f15a15b7',
          content: noteRequest.content ?? '',
        };
        appendMockNote(newNote);
        return newNote;
      },
    }));

    mockDeleteNoteTrigger.mockImplementation(async (noteId: string) => {
      removeMockNote(noteId);
      return { data: { id: noteId } };
    });

    mockPatchNoteTrigger.mockImplementation(async ({ id, content }: Partial<INote>) => {
      if (id && content) {
        updateMockNote(id, content);
      }
      return { data: { id, content } };
    });

    mockPostNoteImageTrigger.mockResolvedValue({ data: {} });
    mockDeleteNoteImageTrigger.mockResolvedValue({ data: {} });
    mockIsConfirmed.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockNotesSubscribers.clear();
  });

  it('renders the component wrappers', async () => {
    const { getByTestId } = await renderWithNotesLoaded();

    expect(getByTestId('notes-page')).toBeInTheDocument();
  });

  it('renders the new note form', async () => {
    const { getByTestId, getByLabelText, getByRole } = await renderWithNotesLoaded();

    expect(getByTestId('new-note-textarea')).toBeInTheDocument();
    expect(getByLabelText('writeNote')).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'writeNote' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'save' })).toBeInTheDocument();
  });

  it('renders the existing notes', async () => {
    const { getByText } = await renderWithNotesLoaded();

    mockNotes.data.forEach((n) => {
      const author = `${n.updatedBy.first_name} ${n.updatedBy.last_name}`;

      expect(getByText(stringToDateTime(n.createdDate))).toBeInTheDocument();
      expect(getByText(author)).toBeInTheDocument();
      expect(getByText(n.content)).toBeInTheDocument();
    });
  });

  it('renders history label and history button only if a note has history', async () => {
    const { findAllByText, findAllByRole } = await renderWithNotesLoaded();

    expect((await findAllByText('modified')).length).toBe(1);
    expect((await findAllByRole('button', { name: 'editHistory' })).length).toBe(1);
  });

  it('renders delete and edit button for every note', async () => {
    const { getAllByRole } = await renderWithNotesLoaded();

    await waitFor(() => expect(getAllByRole('button', { name: 'delete' })).toHaveLength(2));
    await waitFor(() => expect(getAllByRole('button', { name: 'edit' })).toHaveLength(2));
  });

  it('can open history rows if a note has history', async () => {
    const { findByRole, user, container, getByText } = await renderWithNotesLoaded();

    await user.click(await findByRole('button', { name: 'editHistory' }));

    await waitFor(() => expect(container.getElementsByClassName('note-history').length).toBe(2));

    mockNotes.data[0].history.forEach((h) => {
      const author = `${h.updatedBy.first_name} ${h.updatedBy.last_name}`;

      expect(getByText(stringToDateTime(h.updatedDate))).toBeInTheDocument();
      expect(getByText(author)).toBeInTheDocument();
    });
  });

  it('can POST a note', async () => {
    const { user, getByRole, getByText } = await renderWithNotesLoaded();
    const newContent = 'Third note';

    const textarea = getByRole('textbox', { name: 'writeNote' });

    await user.type(textarea, newContent);
    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => expect(mockPostNoteTrigger).toHaveBeenCalledTimes(1));
    expect(mockPostNoteTrigger).toHaveBeenCalledWith(
      expect.objectContaining({ content: newContent }),
    );

    await waitFor(() => expect(getByText(newContent)).toBeInTheDocument());
  });

  it('can DELETE a note', async () => {
    const targetNote = mockNotes.data[0];

    const { user, getByText, findByRole, queryAllByTestId, queryByText } =
      await renderWithNotesLoaded();

    const noteContainer = getByText(targetNote.content).closest('[data-testid="note-container"]');
    if (!(noteContainer instanceof HTMLElement)) {
      throw new Error('Note container not found');
    }

    await user.click(within(noteContainer).getByRole('button', { name: 'delete' }));
    await user.click(await findByRole('button', { name: 'deleteNote' }));

    await waitFor(() => expect(queryAllByTestId('note-container')).toHaveLength(1));
    expect(queryByText(targetNote.content)).toBeNull();
    expect(mockDeleteNoteTrigger).toHaveBeenCalledWith(targetNote.id);
  });

  it('can PATCH a note', async () => {
    const targetNote = mockNotes.data[1];
    const editedContent = 'Note edit.';

    const { user, getByText, queryByText, getAllByTestId, findByTestId } =
      await renderWithNotesLoaded();

    const noteContainer = getByText(targetNote.content).closest('[data-testid="note-container"]');
    if (!(noteContainer instanceof HTMLElement)) {
      throw new Error('Note container not found');
    }

    await user.click(within(noteContainer).getByRole('button', { name: 'edit' }));

    const textarea = await findByTestId('edit-note-textarea');

    await user.clear(textarea);
    await user.type(textarea, editedContent);
    await user.click(await findByTestId('edit-note-save'));

    await waitFor(() => expect(mockPatchNoteTrigger).toHaveBeenCalledTimes(1));
    expect(mockPatchNoteTrigger).toHaveBeenCalledWith(
      expect.objectContaining({ id: targetNote.id, content: editedContent }),
    );

    await waitFor(() => {
      expect(getAllByTestId('note-container')).toHaveLength(2);
      expect(getByText(editedContent)).toBeInTheDocument();
      expect(queryByText(targetNote.content)).toBeNull();
    });
  });

  describe('Note attachments', () => {
    it('renders attachment sections for loaded notes', async () => {
      mockUseGetNoteImagesQuery.mockReset();
      mockUseGetNoteImagesQuery
        .mockReturnValueOnce({ data: mockNoteImages })
        .mockReturnValue({ data: [] });

      const { findByText, findAllByText } = await renderWithNotesLoaded();

      expect(await findByText('noteAttachments.imageAttachments')).toBeInTheDocument();
      mockNoteImages.forEach(async (attachment) => {
        expect(await findByText(attachment.fileName)).toBeInTheDocument();
      });
      expect((await findAllByText('noteAttachments.view')).length).toBe(2);
    });

    it('can POST a note image', async () => {
      const newAttachment = {
        id: 'attachment-3',
        url: 'https://example.com/images/third-image.jpg',
        fileName: 'third-image.jpg',
        size: 150000,
        contentType: 'image/jpeg',
        createdDate: '2026-01-01T12:00:00Z',
        order: 0,
      };

      mockUseGetNoteImagesQuery.mockReset();
      mockUseGetNoteImagesQuery
        .mockReturnValueOnce({ data: [] })
        .mockReturnValue({ data: [newAttachment] });

      mockPostNoteImageTrigger.mockResolvedValue({ data: newAttachment });

      const { user, findByLabelText, getByRole } = await renderWithNotesLoaded();

      const fileInput = (await findByLabelText('noteAttachments.dragAndDrop')) as HTMLInputElement;
      const file = new File(['dummy content'], newAttachment.fileName, {
        type: newAttachment.contentType,
      });

      await user.upload(fileInput, file);
      await user.type(getByRole('textbox', { name: 'writeNote' }), 'Note with attachment');
      await user.click(getByRole('button', { name: 'save' }));

      await waitFor(() => expect(mockPostNoteImageTrigger).toHaveBeenCalledTimes(1));
      const postImageRequest = mockPostNoteImageTrigger.mock.calls[0][0] as {
        noteId: string;
        formData: FormData;
      };

      expect(mockPostNoteImageTrigger).toHaveBeenCalledWith(
        expect.objectContaining({
          noteId: '9bddd912-fe41-4e01-82a5-cca4f15a15b7',
          formData: expect.any(FormData),
        }),
      );
      expect((postImageRequest.formData.get('file') as File)?.name).toBe(newAttachment.fileName);
    });

    it('can DELETE a note image', async () => {
      const targetNote = mockNotes.data[0];
      const targetAttachment = mockNoteImages[0];

      mockUseGetNoteImagesQuery.mockReset();
      mockUseGetNoteImagesQuery.mockImplementation((noteId: string) => ({
        data: noteId === targetNote.id ? [targetAttachment] : [],
      }));

      const { user, findByText, findByTestId } = await renderWithNotesLoaded();

      expect(await findByText(targetAttachment.fileName)).toBeInTheDocument();

      await user.click(await findByTestId(`delete-attachment-${targetAttachment.id}-button`));

      expect(mockIsConfirmed).toHaveBeenCalledWith(
        expect.objectContaining({
          dialogType: 'delete',
          confirmButtonText: 'noteAttachments.deleteDialog.delete',
        }),
      );
      await waitFor(() => expect(mockDeleteNoteImageTrigger).toHaveBeenCalledTimes(1));
      expect(mockDeleteNoteImageTrigger).toHaveBeenCalledWith(
        expect.objectContaining({
          noteId: targetNote.id,
          imageId: targetAttachment.id,
        }),
      );
    });
  });
});
