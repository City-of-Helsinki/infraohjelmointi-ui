import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { selectUser } from '@/reducers/authSlice';
import { selectResponsiblePersonsRaw } from '@/reducers/listsSlice';
import { notifyError } from '@/reducers/notificationSlice';
import { selectStartYear } from '@/reducers/planningSlice';
import { getProjectsWithParams } from '@/services/projectServices';
import { isRequestCanceled } from '@/utils/http';
import { normalizeMyWorkloadDate } from './myWorkloadDateUtils';

export type MyWorkloadViewType = 'design' | 'construction';

const getResponsiblePersonEmail = (project: IProject, viewType: MyWorkloadViewType) => {
  if (viewType === 'construction') {
    return project.personConstruction?.email ?? null;
  }

  return project.personPlanning?.email ?? null;
};

const mapProjectToMyWorkloadTableRow = (
  project: IProject,
  translate: (key: string) => string,
): MyWorkloadTableRow => ({
  id: project.id,
  projectName: project.name,
  description: project.description,
  planningStart: normalizeMyWorkloadDate(project.estPlanningStart),
  planningEnd: normalizeMyWorkloadDate(project.estPlanningEnd),
  presenceStart: normalizeMyWorkloadDate(project.presenceStart),
  presenceEnd: normalizeMyWorkloadDate(project.presenceEnd),
  visibilityStart: normalizeMyWorkloadDate(project.visibilityStart),
  visibilityEnd: normalizeMyWorkloadDate(project.visibilityEnd),
  constructionStart: normalizeMyWorkloadDate(project.estConstructionStart),
  constructionEnd: normalizeMyWorkloadDate(project.estConstructionEnd),
  projectCostForecast: project.projectCostForecast ?? '',
  planningCostForecast: project.planningCostForecast ?? '',
  planningPhaseId: project.planningPhase?.id ?? '',
  planningWorkQuantity: project.planningWorkQuantity ?? '',
  constructionCostForecast: project.constructionCostForecast ?? '',
  costForecast: project.costForecast ?? '',
  phase: project.phase?.value ? translate(`option.${project.phase.value}`) : '',
  phaseValue: project.phase?.value ?? '',
  phaseId: project.phase?.id ?? '',
  functions: translate('myWorkloadView.table.modifyInformation'),
});

const fetchAllProjects = async (year: number, signal: AbortSignal, params = '') => {
  const allProjects: IProject[] = [];
  let fullPath: string | undefined;

  do {
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

    allProjects.push(...response.results);
    fullPath = response.next ?? undefined;
  } while (fullPath);

  return allProjects;
};

const getUniqueResponsiblePersonId = (
  responsiblePersons: ReturnType<typeof selectResponsiblePersonsRaw>,
  userEmail: string,
) => {
  const matches = responsiblePersons.filter((person) => person.email?.toLowerCase() === userEmail);

  return matches.length === 1 ? matches[0].id : undefined;
};

const useMyWorkloadRows = (viewType: MyWorkloadViewType) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const startYear = useAppSelector(selectStartYear);
  const responsiblePersons = useAppSelector(selectResponsiblePersonsRaw);

  const [rows, setRows] = useState<MyWorkloadTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const userEmail = user?.email?.toLowerCase();
    const responsiblePersonId = userEmail
      ? getUniqueResponsiblePersonId(responsiblePersons, userEmail)
      : undefined;

    if (!userEmail) {
      setRows([]);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    const abortController = new AbortController();
    let isActive = true;
    setIsLoading(true);
    setHasError(false);

    const fetchProjects = async () => {
      try {
        const responsiblePersonParam = responsiblePersonId
          ? `${
              viewType === 'construction' ? 'personConstruction' : 'personPlanning'
            }=${responsiblePersonId}`
          : '';

        const allProjects = await fetchAllProjects(
          startYear,
          abortController.signal,
          responsiblePersonParam,
        );
        const filteredProjects = allProjects
          .filter((project) => {
            const responsiblePersonEmail = getResponsiblePersonEmail(project, viewType);
            return responsiblePersonEmail?.toLowerCase() === userEmail;
          })
          .sort((projectA, projectB) => projectA.name.localeCompare(projectB.name, 'fi'));

        if (isActive) {
          setRows(filteredProjects.map((project) => mapProjectToMyWorkloadTableRow(project, t)));
        }
      } catch (e) {
        if (isRequestCanceled(e)) {
          return;
        }
        if (isActive) {
          setRows([]);
          setHasError(true);
          dispatch(
            notifyError({
              message: 'appDataError',
              title: '500',
              type: 'notification',
            }),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [dispatch, responsiblePersons, startYear, user?.email, viewType, t]);

  return { rows, isLoading, hasError };
};

export default useMyWorkloadRows;
