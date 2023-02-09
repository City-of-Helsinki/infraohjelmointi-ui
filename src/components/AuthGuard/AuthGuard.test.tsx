import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { getUserThunk } from '@/reducers/authSlice';
import { setupStore } from '@/store';
import { mockError } from '@/mocks/mockError';
import { IError } from '@/interfaces/common';
import { CustomRenderResult, renderWithProviders } from '@/utils/testUtils';
import { act } from 'react-dom/test-utils';
import AuthGuard from './AuthGuard';
import mockPersons from '@/mocks/mockPersons';

jest.mock('react-i18next', () => mockI18next());
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthGuard', () => {
  let renderResult: CustomRenderResult;

  beforeEach(async () => {
    const store = setupStore();
    mockedAxios.get.mockResolvedValueOnce(mockPersons);
    await act(async () => (renderResult = renderWithProviders(<AuthGuard />, { store })));
  });

  it('adds a user to store if found', async () => {
    const { store } = renderResult;
    const authState = store.getState().auth;
    const user = store.getState().auth.user;

    expect(authState).toBeDefined();
    expect(user).not.toBeNull();
    expect(user).toEqual(mockPersons.data[0]);
  });

  it('catches a failed users fetch', async () => {
    const { store } = renderResult;
    mockedAxios.get.mockRejectedValue(mockError);

    await store.dispatch(getUserThunk());

    const storeError = store.getState().auth.error as IError;
    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
