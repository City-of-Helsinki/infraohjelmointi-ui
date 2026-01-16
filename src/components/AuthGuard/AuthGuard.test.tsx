import axios from 'axios';
import mockI18next from '@/mocks/mockI18next';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import { act } from 'react-dom/test-utils';
import AuthGuard from './AuthGuard';
import { Route } from 'react-router';
import { mockError } from '@/mocks/mockError';
import { IError } from '@/interfaces/common';
import { authApi } from '@/api/authApi';

jest.mock('react-i18next', () => mockI18next());
jest.mock('axios');

const axiosMock = axios as jest.MockedFunction<typeof axios>;

const store = setupStore();

const render = async () =>
  await act(async () => renderWithProviders(<Route path="/" element={<AuthGuard />} />, { store }));

describe('AuthGuard', () => {
  it('catches a failed users fetch', async () => {
    axiosMock.mockRejectedValue({
      response: {
        status: mockError.status,
        data: mockError,
      },
      message: mockError.message,
    });

    const { store } = await render();

    await act(async () => {
      const result = store.dispatch(authApi.endpoints.getUser.initiate());

      try {
        await result.unwrap();
      } catch {
        // Expected rejection for this test case
      } finally {
        result.unsubscribe();
      }
    });

    const storeError = store.getState().auth.error as IError;

    expect(storeError.message).toBe(mockError.message);
    expect(storeError.status).toBe(mockError.status);
  });
});
