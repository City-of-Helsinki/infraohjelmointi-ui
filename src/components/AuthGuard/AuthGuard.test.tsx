import axios from 'axios';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import { act } from 'react';
import AuthGuard from './AuthGuard';
import { Route } from 'react-router';
import { mockError } from '@/mocks/mockError';
import { IError } from '@/interfaces/common';
import { authApi } from '@/api/authApi';
import type { MockedFunction } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { UserRole } from '@/interfaces/userInterfaces';
import { createMockUserWithAdGroups } from '@/mocks/mockUsers';

vi.mock('react-i18next', async () => (await import('@/mocks/mockI18next')).default());
vi.mock('axios');
vi.mock('react-oidc-context', async () => {
  const actual = await vi.importActual<typeof import('react-oidc-context')>('react-oidc-context');
  return {
    ...actual,
    useAuth: () => ({ ...actual.useAuth(), isAuthenticated: true, isLoading: false }),
    hasAuthParams: () => false,
  };
});

const axiosMock = axios as MockedFunction<typeof axios>;

const store = setupStore();

const render = async () =>
  await act(async () => renderWithProviders(<Route path="/" element={<AuthGuard />} />, { store }));

describe('AuthGuard', () => {
  it.each([
    { roles: [UserRole.PROJECT_PROGRAMME_CONTRIBUTOR], restricted: false, allowed: true },
    {
      roles: [UserRole.PROJECT_PROGRAMME_CONTRIBUTOR, UserRole.VIEWER],
      restricted: false,
      allowed: true,
    },
    {
      roles: [UserRole.PROJECT_PROGRAMME_CONTRIBUTOR, UserRole.PROJECT_MANAGER],
      restricted: false,
      allowed: true,
    },
    { roles: [UserRole.PROJECT_PROGRAMME_CONTRIBUTOR], restricted: true, allowed: true },
    { roles: [UserRole.VIEWER], restricted: false, allowed: false },
  ])(
    'programme route access for $roles, restricted=$restricted',
    async ({ roles, restricted, allowed }) => {
      const user = createMockUserWithAdGroups(roles, { is_restricted_programmer: restricted });

      await act(async () =>
        renderWithProviders(
          <>
            <Route
              path="/project/:projectId/project-programme"
              element={
                <>
                  <AuthGuard />
                  <div data-testid="programme-page" />
                </>
              }
            />
            <Route path="*" element={<div data-testid="planning-page" />} />
          </>,
          { preloadedState: { auth: { user, error: null } } },
          { route: '/project/project-1/project-programme' },
        ),
      );

      await waitFor(() => {
        expect(
          screen.getByTestId(allowed ? 'programme-page' : 'planning-page'),
        ).toBeInTheDocument();
        expect(window.location.pathname).toMatch(allowed ? /\/project-programme$/ : /\/planning$/);
      });
    },
  );

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
