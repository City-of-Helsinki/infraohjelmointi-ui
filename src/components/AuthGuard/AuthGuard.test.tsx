import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { getUserThunk } from '@/reducers/authSlice';
import { setupStore } from '@/store';
import { mockError } from '@/mocks/mockError';
import { IError } from '@/interfaces/common';
import { renderWithProviders } from '@/utils/testUtils';
import { act } from 'react-dom/test-utils';
import AuthGuard from './AuthGuard';
import mockPersons from '@/mocks/mockPersons';
import { Route } from 'react-router';

jest.mock('react-i18next', () => mockI18next());
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const store = setupStore();

const render = async () =>
  await act(async () => renderWithProviders(<Route path="/" element={<AuthGuard />} />, { store }));

describe('AuthGuard', () => {
  it('adds a user to store if found', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockPersons);

    const { store } = await render();

    const authState = store.getState().auth;
    const user = store.getState().auth.user;

    expect(authState).toBeDefined();
    expect(user).not.toBeNull();
    expect(user).toEqual(mockPersons.data[0]);
  });

  it('catches a failed users fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);

    const { store } = await render();

    await store.dispatch(getUserThunk());
    const storeError = store.getState().auth.error as IError;

    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
