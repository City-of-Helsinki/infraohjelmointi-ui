import mockI18next from '@/mocks/mockI18next';
import mockProject from '@/mocks/mockProject';
import { mockUser } from '@/mocks/mockUsers';
import { waitFor } from '@testing-library/react';
import { IProject, IProjectsResponse } from '@/interfaces/projectInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import { Route } from 'react-router';
import { setupStore } from '@/store';
import { renderWithProviders } from '@/utils/testUtils';
import MyWorkloadBaseView from './MyWorkloadBaseView';

jest.mock('react-i18next', () => mockI18next());

jest.mock('@/services/projectServices', () => ({
  getProjectsWithParams: jest.fn(),
}));

const mockedGetProjectsWithParams = getProjectsWithParams as jest.MockedFunction<
  typeof getProjectsWithParams
>;

const makeProject = (
  id: string,
  personPlanningEmail: string | null,
  personConstructionEmail: string | null,
) =>
  ({
    ...mockProject.data,
    id,
    name: `Project ${id}`,
    description: `Description ${id}`,
    personPlanning: personPlanningEmail
      ? {
          ...mockProject.data.personPlanning,
          email: personPlanningEmail,
        }
      : undefined,
    personConstruction: personConstructionEmail
      ? {
          ...mockProject.data.personConstruction,
          email: personConstructionEmail,
        }
      : undefined,
  } as IProject);

const makeResponse = (results: IProject[], next: string | null = null): IProjectsResponse => ({
  count: results.length,
  next,
  results,
});

const createDeferred = <T,>() => {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  if (!resolvePromise) {
    throw new Error('Deferred resolver was not initialized');
  }

  return { promise, resolve: resolvePromise };
};

const renderBaseView = (email = 'user@hel.fi') => {
  const baseStore = setupStore();
  return renderWithProviders(<Route path="*" element={<MyWorkloadBaseView />} />, {
    preloadedState: {
      auth: {
        ...baseStore.getState().auth,
        user: {
          ...mockUser.data,
          email,
        },
      },
      planning: {
        ...baseStore.getState().planning,
        startYear: 2026,
      },
      lists: {
        ...baseStore.getState().lists,
        responsiblePersonsRaw: [
          {
            id: 'responsible-person-id',
            firstName: 'Test',
            lastName: 'Person',
            email,
            phone: '',
            title: '',
          },
        ],
      },
    },
  });
};

let consoleErrorSpy: jest.SpyInstance;

describe('MyWorkloadBaseView', () => {
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
      const firstArg = String(args[0] ?? '');
      if (firstArg.includes('Could not parse CSS stylesheet')) {
        return;
      }
      // eslint-disable-next-line no-console
      console.warn(...args);
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    mockedGetProjectsWithParams.mockReset();
  });

  it('shows construction button selected when user email is found only in personConstruction', async () => {
    mockedGetProjectsWithParams.mockImplementation(async ({ params }) => {
      if (params === 'personConstruction=responsible-person-id') {
        return makeResponse([makeProject('project-1', 'someoneelse@hel.fi', 'user@hel.fi')]);
      }

      if (params === 'personPlanning=responsible-person-id') {
        return makeResponse([]);
      }

      return makeResponse([]);
    });

    const { getByRole } = renderBaseView();

    const constructionButton = getByRole('button', {
      name: /myWorkloadView.viewTypeConstruction/i,
    });
    const planningButton = getByRole('button', {
      name: /myWorkloadView.viewTypePlanning/i,
    });

    await waitFor(() => {
      expect(constructionButton).toBeDisabled();
      expect(planningButton).toBeEnabled();
    });

    expect(mockedGetProjectsWithParams).toHaveBeenCalledWith(
      {
        params: 'personConstruction=responsible-person-id',
        year: 2026,
        forcedToFrame: false,
        direct: false,
      },
      false,
      { signal: expect.any(AbortSignal) },
    );
  });

  it('keeps planning selected when user email is found only in personPlanning', async () => {
    mockedGetProjectsWithParams.mockImplementation(async ({ params }) => {
      if (params === 'personPlanning=responsible-person-id') {
        return makeResponse([makeProject('project-1', 'user@hel.fi', 'someoneelse@hel.fi')]);
      }

      if (params === 'personConstruction=responsible-person-id') {
        return makeResponse([]);
      }

      return makeResponse([]);
    });

    const { getByRole } = renderBaseView();

    const planningButton = getByRole('button', {
      name: /myWorkloadView.viewTypePlanning/i,
    });

    await waitFor(() => {
      expect(planningButton).toBeDisabled();
    });
  });

  it('does not flash empty state while resolving view type and starting row fetch', async () => {
    const deferredRowsResponse = createDeferred<ReturnType<typeof makeResponse>>();
    let constructionCallCount = 0;

    mockedGetProjectsWithParams.mockImplementation(({ params }) => {
      if (params === 'personConstruction=responsible-person-id') {
        constructionCallCount += 1;

        if (constructionCallCount === 1) {
          // View type resolution request.
          return Promise.resolve(
            makeResponse([makeProject('project-1', 'someoneelse@hel.fi', 'user@hel.fi')]),
          );
        }

        // Row fetching request for the selected view.
        return deferredRowsResponse.promise;
      }

      if (params === 'personPlanning=responsible-person-id') {
        return Promise.resolve(makeResponse([]));
      }

      return Promise.resolve(makeResponse([]));
    });

    const { queryByText } = renderBaseView();

    await waitFor(() => {
      expect(mockedGetProjectsWithParams).toHaveBeenCalledWith(
        {
          params: 'personConstruction=responsible-person-id',
          year: 2026,
          forcedToFrame: false,
          direct: false,
        },
        false,
        { signal: expect.any(AbortSignal) },
      );
    });

    expect(queryByText('myWorkloadView.table.emptyText')).toBeNull();

    deferredRowsResponse.resolve(
      makeResponse([makeProject('project-1', 'someoneelse@hel.fi', 'user@hel.fi')]),
    );

    await waitFor(() => {
      expect(queryByText('myWorkloadView.table.emptyText')).toBeNull();
    });
  });
});
