import mockI18next from '@/mocks/mockI18next';
import axios from 'axios';
import mockProject from '@/mocks/mockProject';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import ProjectNotes from './ProjectNotes';
import mockNotes from '@/mocks/mockNotes';
import { setupStore } from '@/store';
import {
  deleteNoteThunk,
  getNotesByProjectThunk,
  patchNoteThunk,
  postNoteThunk,
} from '@/reducers/noteSlice';
import { getProjectThunk } from '@/reducers/projectSlice';
import { stringToDateTime } from '@/utils/common';
import { INote } from '@/interfaces/noteInterfaces';
import { mockError } from '@/mocks/mockError';
import { IError } from '@/interfaces/common';
import { waitFor } from '@testing-library/react';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProjectNotes', () => {
  const store = setupStore();
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockProject);
    await store.dispatch(getProjectThunk(mockProject.data.id));

    mockedAxios.get.mockResolvedValue(mockNotes);
    await store.dispatch(getNotesByProjectThunk(mockProject.data.id));

    renderResult = renderWithProviders(<ProjectNotes />, { store });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('renders the component wrappers', async () => {
    const { container } = renderResult;

    expect(container.getElementsByClassName('notes-page-container').length).toBe(1);
  });

  it('renders the new note form', async () => {
    const { container, getByLabelText, getByRole } = renderResult;

    expect(container.getElementsByClassName('note-form-textarea').length).toBe(1);
    expect(getByLabelText('writeNote')).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'writeNote' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'save' })).toBeInTheDocument();
  });

  it('renders the existing notes', async () => {
    const { getByText } = renderResult;

    mockNotes.data.forEach((n) => {
      const author = `${n.updatedBy.firstName} ${n.updatedBy.lastName}`;

      expect(getByText(stringToDateTime(n.createdDate))).toBeInTheDocument();
      expect(getByText(author)).toBeInTheDocument();
      expect(getByText(n.content)).toBeInTheDocument();
    });
  });

  it('renders history label and history button only if a note has history', async () => {
    const { getAllByText, getAllByRole } = renderResult;

    expect(getAllByText('modified').length).toBe(1);
    expect(getAllByRole('button', { name: 'editHistory' }).length).toBe(1);
  });

  it('renders delete and edit button for every note', async () => {
    const { getAllByRole } = renderResult;

    expect(getAllByRole('button', { name: 'delete' }).length).toBe(2);
    expect(getAllByRole('button', { name: 'edit' }).length).toBe(2);
  });

  it('can open history rows if a note has history', async () => {
    const { getByRole, user, container, getByText } = renderResult;

    await user.click(getByRole('button', { name: 'editHistory' }));

    expect(container.getElementsByClassName('note-history').length).toBe(2);

    mockNotes.data[0].history.forEach((h) => {
      const author = `${h.updatedBy.firstName} ${h.updatedBy.lastName}`;

      expect(getByText(stringToDateTime(h.updatedDate))).toBeInTheDocument();
      expect(getByText(author)).toBeInTheDocument();
    });
  });

  it('can POST a note', async () => {
    const { user, getByRole, getByText } = renderResult;

    const responseNote = {
      data: {
        ...mockNotes.data[1],
        id: '9bddd912-fe41-4e01-82a5-cca4f15a15b7',
        content: 'Third note',
      },
    };
    mockedAxios.post.mockResolvedValue(Promise.resolve(responseNote));

    const textarea = getByRole('textbox', { name: 'writeNote' });

    await user.type(textarea, responseNote.data.content);
    await user.click(getByRole('button', { name: 'save' }));

    const formPatchRequest = mockedAxios.post.mock.lastCall[1] as INote;

    expect(formPatchRequest.content).toEqual(responseNote.data.content);
    await waitFor(() => expect(getByText(responseNote.data.content)).toBeInTheDocument());
  });

  it('can DELETE a note', async () => {
    const { user, getByRole, container, getAllByRole } = renderResult;

    mockedAxios.delete.mockResolvedValue(
      Promise.resolve({
        data: {
          id: '9bddd905-fe41-4e01-82a5-cca4f30a15b7',
        },
      }),
    );

    await user.click(getAllByRole('button', { name: 'delete' })[1]);
    await user.click(getByRole('button', { name: 'deleteNote' }));

    expect(container.getElementsByClassName('note-container').length).toBe(1);
  });

  it('can PATCH a note', async () => {
    const { user, queryByText, container, getAllByRole, getByTestId, getByText } = renderResult;

    const responseNote = {
      data: {
        ...mockNotes.data[1],
        content: 'Note edit.',
      },
    };

    mockedAxios.patch.mockResolvedValue(Promise.resolve(responseNote));

    await user.click(getAllByRole('button', { name: 'edit' })[1]);

    const textarea = getByTestId('edit-note-textarea');

    await user.clear(textarea);
    await user.type(textarea, responseNote.data.content);
    await user.click(getByTestId('edit-note-save'));

    const formPatchRequest = mockedAxios.patch.mock.lastCall[1] as INote;

    await waitFor(() => {
      expect(container.getElementsByClassName('note-container').length).toBe(2);
      expect(formPatchRequest.content).toEqual(responseNote.data.content);
      expect(getByText(responseNote.data.content)).toBeInTheDocument();
      expect(queryByText(mockNotes.data[1].content)).toBeNull();
    });
  });

  it('catches a bad notes GET request', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getNotesByProjectThunk(''));

    const storeError = store.getState().note.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a bad notes PATCH request', async () => {
    mockedAxios.patch.mockRejectedValue(mockError);
    await store.dispatch(patchNoteThunk({}));

    const storeError = store.getState().note.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a bad notes DELETE request', async () => {
    mockedAxios.delete.mockRejectedValue(mockError);
    await store.dispatch(deleteNoteThunk(''));

    const storeError = store.getState().note.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });

  it('catches a bad notes POST request', async () => {
    mockedAxios.post.mockRejectedValue(mockError);
    await store.dispatch(postNoteThunk({}));

    const storeError = store.getState().note.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});