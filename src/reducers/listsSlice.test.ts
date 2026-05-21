import listsReducer, {
  deleteMenuItemsThunk,
  patchMenuItemsThunk,
  postMenuItemsThunk,
} from './listsSlice';
import { IPerson } from '@/interfaces/personsInterfaces';

const createState = () => listsReducer(undefined, { type: 'init' });

const createPerson = (id: string, firstName: string, lastName: string): IPerson => ({
  id,
  firstName,
  lastName,
  email: `${firstName.toLowerCase()}@example.com`,
  phone: '0401234567',
  title: 'Engineer',
});

describe('listsSlice admin menu person list synchronization', () => {
  it('updates responsiblePersons when a responsiblePersonsRaw row is added', () => {
    const state = {
      ...createState(),
      responsiblePersonsRaw: [createPerson('1', 'Alice', 'Zephyr')],
      responsiblePersons: [],
    };

    const addedPerson = createPerson('2', 'Bob', 'Anders');

    const nextState = listsReducer(
      state,
      postMenuItemsThunk.fulfilled(addedPerson, 'req-1', {
        path: 'persons',
        listType: 'responsiblePersonsRaw',
        request: { firstName: 'Bob', lastName: 'Anders', email: 'bob@example.com' },
      }),
    );

    expect(nextState.responsiblePersonsRaw).toHaveLength(2);
    expect(nextState.responsiblePersons).toEqual([
      { id: '2', value: 'Anders Bob' },
      { id: '1', value: 'Zephyr Alice' },
    ]);
  });

  it('updates responsiblePersons when a responsiblePersonsRaw row is edited', () => {
    const state = {
      ...createState(),
      responsiblePersonsRaw: [createPerson('1', 'Alice', 'Zephyr')],
      responsiblePersons: [{ id: '1', value: 'Zephyr Alice' }],
    };

    const updatedPerson = createPerson('1', 'Alice', 'Aalto');

    const nextState = listsReducer(
      state,
      patchMenuItemsThunk.fulfilled(updatedPerson, 'req-2', {
        path: 'persons',
        id: '1',
        listType: 'responsiblePersonsRaw',
        request: { firstName: 'Alice', lastName: 'Aalto', email: 'alice@example.com' },
      }),
    );

    expect(nextState.responsiblePersonsRaw[0].lastName).toBe('Aalto');
    expect(nextState.responsiblePersons).toEqual([{ id: '1', value: 'Aalto Alice' }]);
  });

  it('updates responsiblePersons when a responsiblePersonsRaw row is deleted', () => {
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

    const nextState = listsReducer(
      state,
      deleteMenuItemsThunk.fulfilled({ listType: 'responsiblePersonsRaw', rowId: '1' }, 'req-3', {
        path: 'persons',
        id: '1',
        listType: 'responsiblePersonsRaw',
      }),
    );

    expect(nextState.responsiblePersonsRaw).toHaveLength(1);
    expect(nextState.responsiblePersons).toEqual([{ id: '2', value: 'Aalto Bob' }]);
  });

  it('updates programmers when a programmersRaw row is added', () => {
    const state = {
      ...createState(),
      programmersRaw: [createPerson('1', 'Alice', 'Coder')],
      programmers: [],
    };

    const addedProgrammer = createPerson('2', 'Bob', 'Builder');

    const nextState = listsReducer(
      state,
      postMenuItemsThunk.fulfilled(addedProgrammer, 'req-4', {
        path: 'project-programmers',
        listType: 'programmersRaw',
        request: { firstName: 'Bob', lastName: 'Builder' },
      }),
    );

    expect(nextState.programmersRaw).toHaveLength(2);
    expect(nextState.programmers).toEqual([
      { id: '1', value: 'Alice Coder' },
      { id: '2', value: 'Bob Builder' },
    ]);
  });

  it('updates programmers when a programmersRaw row is edited', () => {
    const state = {
      ...createState(),
      programmersRaw: [createPerson('1', 'Alice', 'Coder')],
      programmers: [{ id: '1', value: 'Alice Coder' }],
    };

    const updatedProgrammer = createPerson('1', 'Aino', 'Coder');

    const nextState = listsReducer(
      state,
      patchMenuItemsThunk.fulfilled(updatedProgrammer, 'req-5', {
        path: 'project-programmers',
        id: '1',
        listType: 'programmersRaw',
        request: { firstName: 'Aino', lastName: 'Coder' },
      }),
    );

    expect(nextState.programmersRaw[0].firstName).toBe('Aino');
    expect(nextState.programmers).toEqual([{ id: '1', value: 'Aino Coder' }]);
  });

  it('updates programmers when a programmersRaw row is deleted', () => {
    const state = {
      ...createState(),
      programmersRaw: [createPerson('1', 'Alice', 'Coder'), createPerson('2', 'Bob', 'Builder')],
      programmers: [
        { id: '1', value: 'Alice Coder' },
        { id: '2', value: 'Bob Builder' },
      ],
    };

    const nextState = listsReducer(
      state,
      deleteMenuItemsThunk.fulfilled({ listType: 'programmersRaw', rowId: '1' }, 'req-6', {
        path: 'project-programmers',
        id: '1',
        listType: 'programmersRaw',
      }),
    );

    expect(nextState.programmersRaw).toHaveLength(1);
    expect(nextState.programmers).toEqual([{ id: '2', value: 'Bob Builder' }]);
  });
});
