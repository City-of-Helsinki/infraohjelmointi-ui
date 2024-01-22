import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import { act } from 'react-dom/test-utils';
import AuthGuard from './AuthGuard';
import { Route } from 'react-router';
import { mockError } from '@/mocks/mockError';
import { getUserThunk } from '@/reducers/authSlice';
import { IError } from '@/interfaces/common';

jest.mock('react-i18next', () => mockI18next());
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const store = setupStore();

const render = async () =>
  await act(async () => renderWithProviders(<Route path="/" element={<AuthGuard />} />, { store }));

describe('AuthGuard', () => {
  it('catches a failed users fetch', async () => {
    mockedAxios.get.mockRejectedValue(mockError);

    const { store } = await render();

    await act(async () => {
      await store.dispatch(getUserThunk());
    });

    const storeError = store.getState().auth.error as IError;

    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
