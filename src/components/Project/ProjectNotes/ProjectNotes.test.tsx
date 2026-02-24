import mockI18next from '@/mocks/mockI18next';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import mockProject from '@/mocks/mockProject';
import { renderWithProviders } from '@/utils/testUtils';
import ProjectNotes from './ProjectNotes';
import mockNotes from '@/mocks/mockNotes';
import { INote, INoteRequest } from '@/interfaces/noteInterfaces';
import { mockError } from '@/mocks/mockError';
import { act, waitFor, within } from '@testing-library/react';
import { stringToDateTime } from '@/utils/dates';
import { Route } from 'react-router';
import { notesApi } from '@/api/notesApi';
import { setupStore } from '@/store';

jest.mock('axios');
jest.mock('react-i18next', () => mockI18next());

const mockedAxios = axios as jest.MockedFunction<typeof axios>;

const createInternalConfig = (): InternalAxiosRequestConfig =>
  ({ headers: {} } as InternalAxiosRequestConfig);

const createAxiosResponse = <T,>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: createInternalConfig(),
});

const normalizeConfig = (config?: AxiosRequestConfig | string): AxiosRequestConfig =>
  typeof config === 'string' ? { url: config } : config ?? {};

const createProjectState = () => ({
  selectedProject: mockProject.data,
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
    renderWithProviders(<Route path="/" element={<ProjectNotes />} />, {
      preloadedState: getPreloadedState(),
    }),
  );

const renderWithNotesLoaded = async () => {
  const utils = await render();
  await waitFor(() =>
    expect(utils.queryAllByTestId('note-container').length).toBe(mockNotes.data.length),
  );
  return utils;
};

const getMethod = (config?: AxiosRequestConfig) => (config?.method ?? 'GET').toUpperCase();

const getLastRequestByMethod = (method: string): AxiosRequestConfig | undefined =>
  mockedAxios.mock.calls
    .map(([config]) => normalizeConfig(config as AxiosRequestConfig | string | undefined))
    .filter((config) => getMethod(config) === method.toUpperCase())
    .pop();

const createAxiosError = () => {
  const response = createAxiosResponse(mockError);
  response.status = mockError.status ?? 500;
  response.statusText = 'Error';

  const axiosError = new AxiosError(mockError.message);
  axiosError.response = response;
  axiosError.config = createInternalConfig();

  return axiosError;
};

type QueryErrorResult = { error?: { status?: number; data?: unknown }; unsubscribe?: () => void };

const expectQueryError = (result: QueryErrorResult) => {
  expect(result.error).toEqual({ status: mockError.status, data: mockError });
  result.unsubscribe?.();
};

const createTestStore = () => setupStore(getPreloadedState());

describe('ProjectNotes', () => {
  beforeEach(() => {
    mockedAxios.mockImplementation((config?: AxiosRequestConfig | string) => {
      normalizeConfig(config);
      return Promise.resolve(createAxiosResponse(mockNotes.data));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockedAxios.mockReset();
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
    const responseNote = createAxiosResponse({
      ...mockNotes.data[1],
      id: '9bddd912-fe41-4e01-82a5-cca4f15a15b7',
      content: 'Third note',
    });
    let notesState: INote[] = [...mockNotes.data];

    mockedAxios.mockImplementation((config) => {
      const axiosConfig = normalizeConfig(config);
      const method = getMethod(axiosConfig);

      if (method === 'POST') {
        notesState = [...notesState, responseNote.data];
        return Promise.resolve(responseNote);
      }

      return Promise.resolve(createAxiosResponse(notesState));
    });

    const { user, getByRole, getByText } = await renderWithNotesLoaded();

    const textarea = getByRole('textbox', { name: 'writeNote' });

    await user.type(textarea, responseNote.data.content);
    await user.click(getByRole('button', { name: 'save' }));

    await waitFor(() => expect(getLastRequestByMethod('POST')).toBeDefined());
    const formRequest = getLastRequestByMethod('POST');

    expect((formRequest?.data as INote).content).toEqual(responseNote.data.content);
    await waitFor(() => expect(getByText(responseNote.data.content)).toBeInTheDocument());
  });

  it('can DELETE a note', async () => {
    const targetNote = mockNotes.data[0];
    let notesState: INote[] = [...mockNotes.data];

    mockedAxios.mockImplementation((config) => {
      const axiosConfig = normalizeConfig(config);
      const method = getMethod(axiosConfig);

      if (method === 'DELETE') {
        notesState = notesState.filter((note) => note.id !== targetNote.id);
        return Promise.resolve(createAxiosResponse({ id: targetNote.id }));
      }

      return Promise.resolve(createAxiosResponse(notesState));
    });

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

    const deleteRequest = getLastRequestByMethod('DELETE');
    expect(deleteRequest?.url ?? '').toContain(targetNote.id);
  });

  it('can PATCH a note', async () => {
    const targetNote = mockNotes.data[1];
    const responseNote = createAxiosResponse({
      ...targetNote,
      content: 'Note edit.',
    });

    let notesState: INote[] = [...mockNotes.data];

    mockedAxios.mockImplementation((config) => {
      const axiosConfig = normalizeConfig(config);
      const method = getMethod(axiosConfig);

      if (method === 'PATCH') {
        const payload = axiosConfig.data as Partial<INote>;
        notesState = notesState.map((note) =>
          note.id === payload.id ? { ...note, ...responseNote.data } : note,
        );
        return Promise.resolve(responseNote);
      }

      return Promise.resolve(createAxiosResponse(notesState));
    });

    const { user, getByText, queryByText, getAllByTestId, findByTestId } =
      await renderWithNotesLoaded();

    const noteContainer = getByText(targetNote.content).closest('[data-testid="note-container"]');
    if (!(noteContainer instanceof HTMLElement)) {
      throw new Error('Note container not found');
    }

    await user.click(within(noteContainer).getByRole('button', { name: 'edit' }));

    const textarea = await findByTestId('edit-note-textarea');

    await user.clear(textarea);
    await user.type(textarea, responseNote.data.content);
    await user.click(await findByTestId('edit-note-save'));

    await waitFor(() => expect(getLastRequestByMethod('PATCH')).toBeDefined());
    const patchRequest = getLastRequestByMethod('PATCH');

    await waitFor(() => {
      expect(getAllByTestId('note-container')).toHaveLength(2);
      expect((patchRequest?.data as INote).content).toEqual(responseNote.data.content);
      expect(getByText(responseNote.data.content)).toBeInTheDocument();
      expect(queryByText(targetNote.content)).toBeNull();
    });
  });

  it('catches a bad notes GET request', async () => {
    const store = createTestStore();

    mockedAxios.mockRejectedValueOnce(createAxiosError());

    const result = (await store.dispatch(
      notesApi.endpoints.getNotesByProject.initiate(mockProject.data.id),
    )) as QueryErrorResult;

    expectQueryError(result);
  });

  it('catches a bad notes PATCH request', async () => {
    const store = createTestStore();

    mockedAxios.mockRejectedValueOnce(createAxiosError());

    const result = (await store.dispatch(
      notesApi.endpoints.patchNote.initiate({ id: mockNotes.data[0].id }),
    )) as QueryErrorResult;

    expectQueryError(result);
  });

  it('catches a bad notes DELETE request', async () => {
    const store = createTestStore();

    mockedAxios.mockRejectedValueOnce(createAxiosError());

    const result = (await store.dispatch(
      notesApi.endpoints.deleteNote.initiate(mockNotes.data[0].id),
    )) as QueryErrorResult;

    expectQueryError(result);
  });

  it('catches a bad notes POST request', async () => {
    const store = createTestStore();
    mockedAxios.mockRejectedValueOnce(createAxiosError());

    const noteRequest: INoteRequest = {
      content: 'New note',
      project: mockProject.data.id,
    };

    const result = (await store.dispatch(
      notesApi.endpoints.postNote.initiate(noteRequest),
    )) as QueryErrorResult;

    expectQueryError(result);
  });
});
