import moment from 'moment';
import { selectUser } from '@/reducers/authSlice';
import { selectResponsiblePersonsRaw } from '@/reducers/listsSlice';
import { getProjectsWithParams } from '@/services/projectServices';
import { MyWorkloadViewType, PhaseInfo } from '@/interfaces/myWorkloadInterfaces';
import { IListItem } from '@/interfaces/common';
import { FieldPath } from 'react-hook-form';
import { TFunction } from 'i18next';

const MY_WORKLOAD_DATE_FORMATS = ['DD.MM.YYYY', 'D.M.YYYY', 'YYYY-MM-DD'];

const parseMyWorkloadDate = (date?: string | null) => {
  if (!date) {
    return null;
  }

  const normalizedDate = date.trim().replace(/\s+/g, '');
  const parsed = moment(normalizedDate, MY_WORKLOAD_DATE_FORMATS, true);
  return parsed.isValid() ? parsed : null;
};

export const normalizeMyWorkloadDate = (date?: string | null): string => {
  const parsed = parseMyWorkloadDate(date);
  return parsed ? parsed.format('DD.MM.YYYY') : '';
};

export const formatMyWorkloadDateForDisplay = (date?: string | null): string => {
  const parsed = parseMyWorkloadDate(date);
  return parsed ? parsed.format('D.M.YYYY') : '';
};

export const getMyWorkloadDateTimeValue = (date?: string | null): number => {
  const parsed = parseMyWorkloadDate(date);
  return parsed ? parsed.valueOf() : Number.NEGATIVE_INFINITY;
};

export const toPhaseInfo = (
  listItem: IListItem | undefined,
  translate: (key: string) => string,
): PhaseInfo => ({
  id: listItem?.id ?? '',
  label: listItem?.value ? translate(`option.${listItem.value}`) : '',
  value: listItem?.value ?? '',
});

const hasResponsibleEmailMatch = (emailFromProject: string | undefined, userEmail: string) =>
  emailFromProject?.toLowerCase() === userEmail;

export const getUniqueResponsiblePersonId = (
  responsiblePersons: ReturnType<typeof selectResponsiblePersonsRaw>,
  userEmail: string,
) => {
  const matches = responsiblePersons.filter((person) => person.email?.toLowerCase() === userEmail);
  return matches.length === 1 ? matches[0].id : undefined;
};

type RoleField = 'personPlanning' | 'personConstruction';

const hasEmailMatchForField = (
  projects: Array<{ personPlanning?: { email?: string }; personConstruction?: { email?: string } }>,
  userEmail: string,
  field: RoleField,
) =>
  projects.some((project) =>
    field === 'personPlanning'
      ? hasResponsibleEmailMatch(project.personPlanning?.email, userEmail)
      : hasResponsibleEmailMatch(project.personConstruction?.email, userEmail),
  );

const fetchHasRoleMatch = async (
  year: number,
  signal: AbortSignal,
  userEmail: string,
  field: RoleField,
  params: string,
) => {
  const firstResponse = await getProjectsWithParams(
    {
      params,
      year,
      forcedToFrame: false,
      direct: false,
      fullPath: undefined,
    },
    false,
    { signal },
  );

  if (hasEmailMatchForField(firstResponse.results, userEmail, field)) {
    return true;
  }

  let fullPath = firstResponse.next ?? undefined;

  while (fullPath != null) {
    const response = await getProjectsWithParams(
      {
        params,
        year,
        forcedToFrame: false,
        direct: false,
        fullPath,
      },
      false,
      { signal },
    );

    if (hasEmailMatchForField(response.results, userEmail, field)) {
      return true;
    }

    fullPath = response.next ?? undefined;
  }

  return false;
};

const fetchRoleMatchesFromUnfilteredProjects = async (
  year: number,
  signal: AbortSignal,
  userEmail: string,
) => {
  const firstResponse = await getProjectsWithParams(
    {
      params: '',
      year,
      forcedToFrame: false,
      direct: false,
      fullPath: undefined,
    },
    false,
    { signal },
  );

  let hasPlanning = hasEmailMatchForField(firstResponse.results, userEmail, 'personPlanning');
  let hasConstruction = hasEmailMatchForField(
    firstResponse.results,
    userEmail,
    'personConstruction',
  );

  if (hasPlanning && hasConstruction) {
    return { hasPlanning, hasConstruction };
  }

  let fullPath = firstResponse.next ?? undefined;

  while (fullPath != null) {
    const response = await getProjectsWithParams(
      {
        params: '',
        year,
        forcedToFrame: false,
        direct: false,
        fullPath,
      },
      false,
      { signal },
    );

    if (!hasPlanning) {
      hasPlanning = hasEmailMatchForField(response.results, userEmail, 'personPlanning');
    }

    if (!hasConstruction) {
      hasConstruction = hasEmailMatchForField(response.results, userEmail, 'personConstruction');
    }

    if (hasPlanning && hasConstruction) {
      return { hasPlanning, hasConstruction };
    }

    fullPath = response.next ?? undefined;
  }

  return { hasPlanning, hasConstruction };
};

export const getMyWorkloadViewType = async (
  user: ReturnType<typeof selectUser>,
  year: number,
  signal: AbortSignal,
  responsiblePersons: ReturnType<typeof selectResponsiblePersonsRaw> = [],
): Promise<MyWorkloadViewType> => {
  const userEmail = user?.email?.toLowerCase();

  if (!userEmail) {
    return 'planning';
  }

  const responsiblePersonId = getUniqueResponsiblePersonId(responsiblePersons, userEmail);
  let hasPlanning = false;
  let hasConstruction = false;

  if (responsiblePersonId) {
    const [planningResponse, constructionResponse] = await Promise.all([
      fetchHasRoleMatch(
        year,
        signal,
        userEmail,
        'personPlanning',
        `personPlanning=${responsiblePersonId}`,
      ),
      fetchHasRoleMatch(
        year,
        signal,
        userEmail,
        'personConstruction',
        `personConstruction=${responsiblePersonId}`,
      ),
    ]);

    hasPlanning = planningResponse;
    hasConstruction = constructionResponse;
  } else {
    ({ hasPlanning, hasConstruction } = await fetchRoleMatchesFromUnfilteredProjects(
      year,
      signal,
      userEmail,
    ));
  }

  if (hasConstruction && !hasPlanning) {
    return 'construction';
  }

  return 'planning';
};
