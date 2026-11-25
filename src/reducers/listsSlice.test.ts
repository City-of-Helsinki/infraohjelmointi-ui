import axios, { AxiosRequestConfig } from 'axios';
import listsReducer, { getListsThunk, IListState } from './listsSlice';
import { listsApi } from '@/api/listsApi';
import { setupStore } from '@/store';
import { IPerson } from '@/interfaces/personsInterfaces';
import { mockGetResponseProvider } from '@/utils/mockGetResponseProvider';
import { mockError } from '@/mocks/mockError';
import { mockProjectTypes } from '@/mocks/mockLists';
import type { MockedFunction } from 'vitest';

vi.mock('axios');

const mockedAxios = axios as MockedFunction<typeof axios>;

const createState = () => listsReducer(undefined, { type: 'init' });

type Store = ReturnType<typeof setupStore>;

const runMutation = async (
  lists: IListState,
  response: unknown,
  mutate: (dispatch: Store['dispatch']) => { unwrap: () => Promise<unknown> },
) => {
  const store = setupStore({ lists });
  mockedAxios.mockResolvedValueOnce({ data: response });
  await mutate(store.dispatch).unwrap();
  return store.getState().lists;
};

const createPerson = (id: string, firstName: string, lastName: string): IPerson => ({
  id,
  firstName,
  lastName,
  email: `${firstName.toLowerCase()}@example.com`,
  phone: '0401234567',
  title: 'Engineer',
});

describe('listsSlice admin menu person list synchronization', () => {
  it('updates responsiblePersons when a responsiblePersonsRaw row is added', async () => {
    const state = {
      ...createState(),
      responsiblePersonsRaw: [createPerson('1', 'Alice', 'Zephyr')],
      responsiblePersons: [],
    };

    const addedPerson = createPerson('2', 'Bob', 'Anders');

    const nextState = await runMutation(state, addedPerson, (dispatch) =>
      dispatch(
        listsApi.endpoints.postMenuListItem.initiate({
          path: 'persons',
          listType: 'responsiblePersonsRaw',
          request: { firstName: 'Bob', lastName: 'Anders', email: 'bob@example.com' },
        }),
      ),
    );

    expect(nextState.responsiblePersonsRaw).toHaveLength(2);
    expect(nextState.responsiblePersons).toEqual([
      { id: '2', value: 'Anders Bob' },
      { id: '1', value: 'Zephyr Alice' },
    ]);
  });

  it('updates responsiblePersons when a responsiblePersonsRaw row is edited', async () => {
    const state = {
      ...createState(),
      responsiblePersonsRaw: [createPerson('1', 'Alice', 'Zephyr')],
      responsiblePersons: [{ id: '1', value: 'Zephyr Alice' }],
    };

    const updatedPerson = createPerson('1', 'Alice', 'Aalto');

    const nextState = await runMutation(state, updatedPerson, (dispatch) =>
      dispatch(
        listsApi.endpoints.patchMenuListItem.initiate({
          path: 'persons',
          id: '1',
          listType: 'responsiblePersonsRaw',
          request: { firstName: 'Alice', lastName: 'Aalto', email: 'alice@example.com' },
        }),
      ),
    );

    expect(nextState.responsiblePersonsRaw[0].lastName).toBe('Aalto');
    expect(nextState.responsiblePersons).toEqual([{ id: '1', value: 'Aalto Alice' }]);
  });

  it('updates responsiblePersons when a responsiblePersonsRaw row is deleted', async () => {
    const state = {
      ...createState(),
      responsiblePersonsRaw: [
        createPerson('1', 'Alice', 'Zephyr'),
        createPerson('2', 'Bob', 'Aalto'),
      ],
      responsiblePersons: [
        { id: '2', value: 'Aalto Bob' },
        { id: '1', value: 'Zephyr Alice' },
      ],
    };

    const nextState = await runMutation(state, undefined, (dispatch) =>
      dispatch(
        listsApi.endpoints.deleteMenuListItem.initiate({
          path: 'persons',
          id: '1',
          listType: 'responsiblePersonsRaw',
        }),
      ),
    );

    expect(nextState.responsiblePersonsRaw).toHaveLength(1);
    expect(nextState.responsiblePersons).toEqual([{ id: '2', value: 'Aalto Bob' }]);
  });

  it('updates programmers when a programmersRaw row is added', async () => {
    const state = {
      ...createState(),
      programmersRaw: [createPerson('1', 'Alice', 'Coder')],
      programmers: [],
    };

    const addedProgrammer = createPerson('2', 'Bob', 'Builder');

    const nextState = await runMutation(state, addedProgrammer, (dispatch) =>
      dispatch(
        listsApi.endpoints.postMenuListItem.initiate({
          path: 'project-programmers',
          listType: 'programmersRaw',
          request: { firstName: 'Bob', lastName: 'Builder' },
        }),
      ),
    );

    expect(nextState.programmersRaw).toHaveLength(2);
    expect(nextState.programmers).toEqual([
      { id: '1', value: 'Alice Coder' },
      { id: '2', value: 'Bob Builder' },
    ]);
  });

  it('updates programmers when a programmersRaw row is edited', async () => {
    const state = {
      ...createState(),
      programmersRaw: [createPerson('1', 'Alice', 'Coder')],
      programmers: [{ id: '1', value: 'Alice Coder' }],
    };

    const updatedProgrammer = createPerson('1', 'Aino', 'Coder');

    const nextState = await runMutation(state, updatedProgrammer, (dispatch) =>
      dispatch(
        listsApi.endpoints.patchMenuListItem.initiate({
          path: 'project-programmers',
          id: '1',
          listType: 'programmersRaw',
          request: { firstName: 'Aino', lastName: 'Coder' },
        }),
      ),
    );

    expect(nextState.programmersRaw[0].firstName).toBe('Aino');
    expect(nextState.programmers).toEqual([{ id: '1', value: 'Aino Coder' }]);
  });

  it('updates programmers when a programmersRaw row is deleted', async () => {
    const state = {
      ...createState(),
      programmersRaw: [createPerson('1', 'Alice', 'Coder'), createPerson('2', 'Bob', 'Builder')],
      programmers: [
        { id: '1', value: 'Alice Coder' },
        { id: '2', value: 'Bob Builder' },
      ],
    };

    const nextState = await runMutation(state, undefined, (dispatch) =>
      dispatch(
        listsApi.endpoints.deleteMenuListItem.initiate({
          path: 'project-programmers',
          id: '1',
          listType: 'programmersRaw',
        }),
      ),
    );

    expect(nextState.programmersRaw).toHaveLength(1);
    expect(nextState.programmers).toEqual([{ id: '2', value: 'Bob Builder' }]);
  });
});

describe('getListsThunk', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves with the remaining lists when a single list request fails', async () => {
    mockGetResponseProvider();
    const defaultRequest = mockedAxios.getMockImplementation() as (
      config?: AxiosRequestConfig | string,
    ) => Promise<unknown>;
    mockedAxios.mockImplementation((config?: AxiosRequestConfig | string) =>
      typeof config === 'object' && config.url?.endsWith('/project-priority/')
        ? Promise.reject(mockError)
        : defaultRequest(config),
    );
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const action = await setupStore().dispatch(getListsThunk());

    expect(action.meta.requestStatus).toBe('fulfilled');
    const payload = action.payload as Partial<IListState>;
    expect(payload.priorities).toEqual([]);
    expect(payload.types).toEqual(mockProjectTypes.data);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting priorities: ', {
      status: mockError.status,
      data: mockError.message,
    });
  });
});
