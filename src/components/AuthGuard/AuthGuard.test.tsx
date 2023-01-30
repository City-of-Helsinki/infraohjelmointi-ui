import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import mockUser from '@/mocks/mockUser';
import { getUserThunk } from '@/reducers/authSlice';
import { setupStore } from '@/store';
import mockUsers from '@/mocks/mockUsers';
import { mockError } from '@/mocks/mockError';
import { IError } from '@/interfaces/common';

jest.mock('react-i18next', () => mockI18next());
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthGuard', () => {
  const store = setupStore();

  beforeEach(async () => {
    mockedAxios.get.mockResolvedValue(mockUsers);
    store.dispatch(getUserThunk());
  });

  it('adds a user to store if found', async () => {
    const authState = store.getState().auth;
    const user = store.getState().auth.user;

    expect(authState).toBeDefined();
    expect(user).not.toBeNull();
    expect(user).toEqual(mockUser);
  });

  it('catches a failed users fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);
    await store.dispatch(getUserThunk());

    const storeError = store.getState().auth.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
