import { Pagination, SupportedLanguage } from 'hds-react';
import { FC, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import MyWorkloadTaskCard from './MyWorkloadTaskCard';
import { useTranslation } from 'react-i18next';
import classes from '../styles.module.css';
import type { IProjectTask } from '@/interfaces/projectInterfaces';
import { formatMyWorkloadDateForDisplay } from '@/utils/myWorkloadUtils';

interface MyWorkloadTasksProps {
  listOfTasks: IProjectTask[];
}

const TASKS_PER_PAGE = 10;
const pageHref = () => '#';

const MyWorkloadTasks: FC<MyWorkloadTasksProps> = ({ listOfTasks }) => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0);

  const dateTextFormatter = (startDate: string | null, endDate: string | null): string => {
    if (!startDate && !endDate) {
      return t('myWorkloadView.tasks.infoNotAvailable');
    } else {
      return `${startDate || t('myWorkloadView.tasks.infoNotAvailable')} - ${
        endDate || t('myWorkloadView.tasks.infoNotAvailable')
      }`;
    }
  };

  const constructionProcurementMethodTextFormatter = (method?: string): string => {
    if (!method) {
      return t('myWorkloadView.tasks.infoNotAvailable');
    } else {
      return t(`option.${method}`);
    }
  };

  const tasks = listOfTasks.map((project) => ({
    id: project.id,
    budget: project.costForecast ?? '',
    projectName: project.name,
    planningPeriod: dateTextFormatter(
      formatMyWorkloadDateForDisplay(project.estPlanningStart),
      formatMyWorkloadDateForDisplay(project.estPlanningEnd),
    ),
    constructionPeriod: dateTextFormatter(
      formatMyWorkloadDateForDisplay(project.estConstructionStart),
      formatMyWorkloadDateForDisplay(project.estConstructionEnd),
    ),
    constructionProcurementMethod: constructionProcurementMethodTextFormatter(
      project.constructionProcurementMethod.value,
    ),
    taskDescription: t(`myWorkloadView.tasks.taskDescription.${project.taskType}`),
    taskType: project.taskType,
  }));

  const pageCount = useMemo(() => Math.ceil(tasks.length / TASKS_PER_PAGE), [tasks.length]);
  const paginatedTasks = useMemo(() => {
    const firstItem = page * TASKS_PER_PAGE;
    return tasks.slice(firstItem, firstItem + TASKS_PER_PAGE);
  }, [tasks, page]);

  useEffect(() => {
    if (page >= pageCount && page > 0) {
      setPage(pageCount - 1);
      return;
    }

    if (tasks.length === 0 && page !== 0) {
      setPage(0);
    }
  }, [tasks.length, page, pageCount]);

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>, selectedPage: number) => {
      event.preventDefault();
      setPage(selectedPage);
    },
    [],
  );

  return (
    <>
      <h2 className={`${classes.sectionTitle} text-heading-m`}>
        {t('myWorkloadView.tasks.title')}
      </h2>
      <ul className={classes.taskList}>
        {paginatedTasks.map((task) => (
          <li key={task.id} className={classes.taskListItem}>
            <MyWorkloadTaskCard task={task} />
          </li>
        ))}
      </ul>
      {pageCount > 1 && (
        <div className="mt-8" data-testid="my-workload-tasks-pagination-container">
          <Pagination
            data-testid="my-workload-tasks-pagination"
            language={i18n.language as SupportedLanguage}
            onChange={handlePageChange}
            pageCount={pageCount}
            pageHref={pageHref}
            pageIndex={page}
            paginationAriaLabel={t('myWorkloadView.tasks.paginationAriaLabel')}
            siblingCount={2}
          />
        </div>
      )}
    </>
  );
};

export default MyWorkloadTasks;
