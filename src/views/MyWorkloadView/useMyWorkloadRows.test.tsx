import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import mockProject from '@/mocks/mockProject';
import { mockUser } from '@/mocks/mockUsers';
import { setupStore } from '@/store';
import { IProject } from '@/interfaces/projectInterfaces';
import { getProjectsWithParams } from '@/services/projectServices';
import useMyWorkloadRows from './useMyWorkloadRows';
import { MyWorkloadViewType } from '@/interfaces/myWorkloadInterfaces';

const stableTranslate = (key: string) => key;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: stableTranslate,
    i18n: {
      changeLanguage: () => Promise.resolve(),
    },
  }),
}));

jest.mock('@/services/projectServices', () => ({
  getProjectsWithParams: jest.fn(),
}));

const mockedGetProjectsWithParams = getProjectsWithParams as jest.MockedFunction<
  typeof getProjectsWithParams
>;

const makeProject = (
  id: string,
  name: string,
  planningEmail: string,
  constructionEmail: string,
  estPlanningStart = '2026-01-10',
): IProject => ({
  ...mockProject.data,
  id,
  name,
  estPlanningStart,
  phase: { id: 'phase-id', value: 'design' },
  personPlanning: {
    id: 'planning-person-id',
    firstName: 'Planning',
    lastName: 'Person',
    email: planningEmail,
    title: '',
    phone: '',
  },
  personConstruction: {
    id: 'construction-person-id',
    firstName: 'Construction',
    lastName: 'Person',
    email: constructionEmail,
    title: '',
    phone: '',
  },
});

const makeResponsiblePerson = (id: string, email: string) => ({
  id,
  firstName: 'Planner',
  lastName: 'Person',
  email,
  title: '',
  phone: '',
});

const renderMyWorkloadHook = (
  viewType: MyWorkloadViewType,
  email = 'planner@hel.fi',
  responsiblePersonsRaw = [makeResponsiblePerson('planning-person-id', 'planner@hel.fi')],
) => {
  const store = setupStore({
    auth: {
      user: {
        ...mockUser.data,
        email,
      },
      error: null,
    },
    planning: {
      ...setupStore().getState().planning,
      startYear: 2026,
    },
    lists: {
      ...setupStore().getState().lists,
      responsiblePersonsRaw,
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  const hook = renderHook(() => useMyWorkloadRows(viewType), { wrapper });

  return { ...hook, store };
};

describe('useMyWorkloadRows', () => {
  beforeEach(() => {
    mockedGetProjectsWithParams.mockReset();
  });

  it('returns empty state without fetch when user email is missing', async () => {
    const { result } = renderMyWorkloadHook('planning', '');

    await waitFor(() => {
      expect(result.current.rows).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
    });

    expect(mockedGetProjectsWithParams).not.toHaveBeenCalled();
  });

  it('filters projects from the API by planning responsible person when a matching person id is available', async () => {
    mockedGetProjectsWithParams.mockResolvedValueOnce({
      results: [
        makeProject('1', 'Beta project', 'planner@hel.fi', 'construction@hel.fi', '2026-01-01'),
        makeProject('2', 'Alpha project', 'planner@hel.fi', 'other@hel.fi', '2026-02-01'),
      ],
      count: 2,
      next: null,
    });

    const { result } = renderMyWorkloadHook('planning');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetProjectsWithParams).toHaveBeenCalledTimes(1);
    expect(mockedGetProjectsWithParams).toHaveBeenCalledWith(
      {
        params: 'personPlanning=planning-person-id',
        year: 2026,
        forcedToFrame: false,
        direct: false,
        fullPath: undefined,
      },
      false,
      { signal: expect.any(AbortSignal) },
    );

    expect(result.current.hasError).toBe(false);
    expect(result.current.rows).toHaveLength(2);
    expect(result.current.rows.map((row) => row.projectName)).toEqual([
      'Alpha project',
      'Beta project',
    ]);
    expect(result.current.rows[0].phase).toBe('option.design');
    expect(result.current.rows[0].planningStart).toBe('01.02.2026');
  });

  it('falls back to the unfiltered project query when the current user is not found in responsible persons', async () => {
    mockedGetProjectsWithParams.mockResolvedValueOnce({
      results: [makeProject('1', 'Project', 'planner@hel.fi', 'construction@hel.fi')],
      count: 1,
      next: null,
    });

    const { result } = renderMyWorkloadHook('planning', 'planner@hel.fi', []);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetProjectsWithParams).toHaveBeenCalledWith(
      {
        params: '',
        year: 2026,
        forcedToFrame: false,
        direct: false,
        fullPath: undefined,
      },
      false,
      { signal: expect.any(AbortSignal) },
    );
  });

  it('falls back to the unfiltered project query when multiple responsible persons share the same email', async () => {
    mockedGetProjectsWithParams.mockResolvedValueOnce({
      results: [makeProject('1', 'Project', 'planner@hel.fi', 'construction@hel.fi')],
      count: 1,
      next: null,
    });

    const duplicatePersons = [
      makeResponsiblePerson('planning-person-id', 'planner@hel.fi'),
      makeResponsiblePerson('planning-person-id-2', 'planner@hel.fi'),
    ];

    const { result } = renderMyWorkloadHook('planning', 'planner@hel.fi', duplicatePersons);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetProjectsWithParams).toHaveBeenCalledWith(
      {
        params: '',
        year: 2026,
        forcedToFrame: false,
        direct: false,
        fullPath: undefined,
      },
      false,
      { signal: expect.any(AbortSignal) },
    );
  });

  it('filters construction rows by construction responsible person', async () => {
    mockedGetProjectsWithParams.mockResolvedValueOnce({
      results: [
        makeProject('1', 'A', 'planner@hel.fi', 'construction@hel.fi'),
        makeProject('2', 'B', 'planner@hel.fi', 'planner@hel.fi'),
      ],
      count: 2,
      next: null,
    });

    const { result } = renderMyWorkloadHook('construction');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].id).toBe('2');
    expect(mockedGetProjectsWithParams).toHaveBeenCalledWith(
      {
        params: 'personConstruction=planning-person-id',
        year: 2026,
        forcedToFrame: false,
        direct: false,
        fullPath: undefined,
      },
      false,
      { signal: expect.any(AbortSignal) },
    );
  });

  it('sets error state and dispatches notification on non-cancel errors', async () => {
    mockedGetProjectsWithParams.mockRejectedValueOnce(new Error('boom'));

    const { result, store } = renderMyWorkloadHook('planning');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(true);
    });

    const notifications = store.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].message).toBe('appDataError');
    expect(notifications[0].title).toBe('500');
    expect(notifications[0].type).toBe('notification');
  });

  it('ignores canceled requests without setting error state', async () => {
    mockedGetProjectsWithParams.mockRejectedValueOnce(
      new AxiosError('canceled', AxiosError.ERR_CANCELED),
    );

    const { result, store } = renderMyWorkloadHook('planning');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasError).toBe(false);
    expect(result.current.rows).toEqual([]);
    expect(store.getState().notifications).toHaveLength(0);
  });
});
