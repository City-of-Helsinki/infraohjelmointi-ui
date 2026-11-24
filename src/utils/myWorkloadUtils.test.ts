import {
  normalizeMyWorkloadDate,
  formatMyWorkloadDateForDisplay,
  getMyWorkloadDateTimeValue,
  getMyWorkloadViewType,
  toPhaseInfo,
} from './myWorkloadUtils';
import { IProject, IProjectsResponse, ProjectTaskType } from '@/interfaces/projectInterfaces';
import { createInstance } from 'i18next';
import { createListItem, createProject } from '@/mocks/createMocks';
import {
  mapProjectToMyWorkloadTableRow,
  mapProjectToMyWorkloadTask,
} from './myWorkloadMappingUtils';
import mockProject from '@/mocks/mockProject';
import { getProjectsWithParams } from '@/services/projectServices';
import type { MockedFunction } from 'vitest';

vi.mock('@/services/projectServices', () => ({
  getProjectsWithParams: vi.fn(),
}));

const mockedGetProjectsWithParams = getProjectsWithParams as MockedFunction<
  typeof getProjectsWithParams
>;

const makeProject = (personPlanningEmail: string | null, personConstructionEmail: string | null) =>
  ({
    ...mockProject.data,
    id: `${personPlanningEmail ?? 'none'}-${personConstructionEmail ?? 'none'}`,
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
  }) as IProject;

const makeResponse = (
  results: IProject[],
  next: string | null = null,
  count = results.length,
): IProjectsResponse => ({
  count,
  next,
  results,
});

describe('workload option translations', () => {
  const instance = createInstance();

  beforeAll(async () => {
    await instance.init({
      lng: 'fi',
      resources: { fi: { translation: { option: { design: 'Translated design' } } } },
    });
  });

  it.each([
    ['design', 'Translated design'],
    ['Custom.value', 'Custom.value'],
    ['de.sign', 'de.sign'],
    ['A {{name}} $t(option.design)', 'A {{name}} $t(option.design)'],
  ])('displays %s as %s in phases, table rows, and task cards', (value, label) => {
    const option = createListItem(value);
    expect(toPhaseInfo(option, instance.t)).toEqual({ id: option.id, value, label });
    expect(
      mapProjectToMyWorkloadTableRow(
        createProject({ phase: option, phaseDetail: option }),
        instance.t,
      ),
    ).toMatchObject({ phase: { label }, phaseDetail: { label } });
    expect(
      mapProjectToMyWorkloadTask(
        {
          id: 'task-project',
          name: 'Test project',
          estPlanningStart: null,
          estPlanningEnd: null,
          estConstructionStart: null,
          estConstructionEnd: null,
          constructionProcurementMethod: option,
          taskType: ProjectTaskType.NAME_CONSTRUCTION_PROJECT_MANAGER,
        },
        instance.t,
      ),
    ).toMatchObject({ constructionProcurementMethod: label });
  });

  it('keeps absent phases empty', () => {
    expect(toPhaseInfo(undefined, instance.t)).toEqual({ id: '', value: '', label: '' });
  });

  it('retains the project group ID in workload rows', () => {
    expect(
      mapProjectToMyWorkloadTableRow(createProject({ projectGroup: 'group-1' }), instance.t),
    ).toMatchObject({ projectGroup: 'group-1' });
    expect(
      mapProjectToMyWorkloadTableRow(createProject({ projectGroup: null }), instance.t),
    ).toMatchObject({ projectGroup: null });
  });
});

describe('myWorkloadDateUtils', () => {
  beforeEach(() => {
    mockedGetProjectsWithParams.mockReset();
  });

  it('normalizes valid dates from all supported input formats', () => {
    expect(normalizeMyWorkloadDate('01.02.2026')).toBe('01.02.2026');
    expect(normalizeMyWorkloadDate('1.2.2026')).toBe('01.02.2026');
    expect(normalizeMyWorkloadDate('2026-02-01')).toBe('01.02.2026');
  });

  it('formats display dates without leading zeros', () => {
    expect(formatMyWorkloadDateForDisplay('01.02.2026')).toBe('1.2.2026');
    expect(formatMyWorkloadDateForDisplay('2026-12-09')).toBe('9.12.2026');
  });

  it('returns comparable time values for date sorting', () => {
    const jan = getMyWorkloadDateTimeValue('01.01.2026');
    const feb = getMyWorkloadDateTimeValue('01.02.2026');

    expect(feb).toBeGreaterThan(jan);
    expect(getMyWorkloadDateTimeValue('31-12-2026')).toBe(Number.NEGATIVE_INFINITY);
  });

  it('returns empty string for invalid, null and empty values', () => {
    expect(normalizeMyWorkloadDate('31-12-2026')).toBe('');
    expect(formatMyWorkloadDateForDisplay('31-12-2026')).toBe('');
    expect(normalizeMyWorkloadDate('')).toBe('');
    expect(normalizeMyWorkloadDate(null)).toBe('');
    expect(normalizeMyWorkloadDate(undefined)).toBe('');
  });

  it('trims extra whitespace in valid values before parsing', () => {
    expect(normalizeMyWorkloadDate('  1. 2.2026  ')).toBe('01.02.2026');
  });

  it('returns planning when user email is missing without API calls', async () => {
    const viewType = await getMyWorkloadViewType(
      { email: '' } as never,
      2026,
      new AbortController().signal,
      [],
    );

    expect(viewType).toBe('planning');
    expect(mockedGetProjectsWithParams).not.toHaveBeenCalled();
  });

  it('returns construction when only construction responsibility is found across paginated responses', async () => {
    mockedGetProjectsWithParams.mockImplementation(async ({ fullPath }) => {
      if (!fullPath) {
        return makeResponse([makeProject('other@hel.fi', 'other@hel.fi')], '/projects/?page=2', 2);
      }

      return makeResponse([makeProject('other@hel.fi', 'user@hel.fi')]);
    });

    const viewType = await getMyWorkloadViewType(
      { email: 'user@hel.fi' } as never,
      2026,
      new AbortController().signal,
      [],
    );

    expect(viewType).toBe('construction');
  });

  it('returns planning when both responsibilities are found from filtered role queries', async () => {
    mockedGetProjectsWithParams.mockImplementation(async ({ params, fullPath }) => {
      if (params === 'personPlanning=person-id') {
        return makeResponse([makeProject('user@hel.fi', null)]);
      }

      if (params === 'personConstruction=person-id') {
        return makeResponse([makeProject(null, 'user@hel.fi')]);
      }

      throw new Error(`unexpected query params: ${params}, fullPath: ${fullPath}`);
    });

    const viewType = await getMyWorkloadViewType(
      { email: 'user@hel.fi' } as never,
      2026,
      new AbortController().signal,
      [
        {
          id: 'person-id',
          firstName: 'Test',
          lastName: 'User',
          email: 'user@hel.fi',
          phone: '',
          title: '',
        },
      ],
    );

    expect(viewType).toBe('planning');
  });
});
