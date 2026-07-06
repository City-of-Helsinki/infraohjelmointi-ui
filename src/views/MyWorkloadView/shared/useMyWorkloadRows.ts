import { useEffect, useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { selectUser } from '@/reducers/authSlice';
import { notifyError } from '@/reducers/notificationSlice';
import { selectStartYear } from '@/reducers/planningSlice';
import { getProjectsWithParams } from '@/services/projectServices';
import { isRequestCanceled } from '@/utils/http';

export type MyWorkloadViewType = 'design' | 'construction';

const formatMyWorkloadDate = (date?: string | null): string => {
  if (!date) {
    return '';
  }

  const normalizedDate = date.trim().replace(/\s+/g, '');
  const parsed = moment(normalizedDate, ['DD.MM.YYYY', 'D.M.YYYY'], true);
  return parsed.isValid() ? parsed.format('D.M.YYYY') : '';
};

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
  planningStart: formatMyWorkloadDate(project.estPlanningStart),
  planningEnd: formatMyWorkloadDate(project.estPlanningEnd),
  phase: project.phase?.value ? translate(`option.${project.phase.value}`) : '',
  phaseValue: project.phase?.value ?? '',
  phaseId: project.phase?.id ?? '',
  planningStartRaw: project.estPlanningStart ?? '',
  planningEndRaw: project.estPlanningEnd ?? '',
  functions: translate('myWorkloadView.table.modifyInformation'),
});

const fetchAllProjects = async (year: number, signal: AbortSignal) => {
  const allProjects: IProject[] = [];
  let fullPath: string | undefined;

  do {
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

    allProjects.push(...response.results);
    fullPath = response.next ?? undefined;
  } while (fullPath);

  return allProjects;
};

const useMyWorkloadRows = (viewType: MyWorkloadViewType) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const startYear = useAppSelector(selectStartYear);

  const [rows, setRows] = useState<MyWorkloadTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const userEmail = user?.email?.toLowerCase();

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
        const allProjects = await fetchAllProjects(startYear, abortController.signal);
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
          dispatch(notifyError({
            message: 'appDataError',
            title: '500',
            type: 'notification',
          }));
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
  }, [dispatch, startYear, user?.email, viewType, t]);

  return { rows, isLoading, hasError };
};

export default useMyWorkloadRows;
