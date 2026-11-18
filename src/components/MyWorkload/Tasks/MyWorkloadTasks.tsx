import { Pagination, SupportedLanguage } from 'hds-react';
import { FC, MouseEvent, useCallback, useMemo, useState } from 'react';
import MyWorkloadTaskCard from './MyWorkloadTaskCard';
import { useTranslation } from 'react-i18next';
import classes from '../styles.module.css';
import type { MyWorkloadTasksProps } from '@/interfaces/myWorkloadInterfaces';
import { mapProjectToMyWorkloadTask } from '@/utils/myWorkloadMappingUtils';

const TASKS_PER_PAGE = 10;
const pageHref = () => '#';

const MyWorkloadTasks: FC<MyWorkloadTasksProps> = ({ listOfTasks }) => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0);

  if (listOfTasks.length === 0 && page !== 0) {
    setPage(0);
  }

  const tasks = listOfTasks.map((project) => mapProjectToMyWorkloadTask(project, t));

  const pageCount = useMemo(() => Math.ceil(tasks.length / TASKS_PER_PAGE), [tasks.length]);
  const currentPage = Math.max(0, Math.min(page, pageCount - 1));
  const paginatedTasks = useMemo(() => {
    const firstItem = currentPage * TASKS_PER_PAGE;
    return tasks.slice(firstItem, firstItem + TASKS_PER_PAGE);
  }, [tasks, currentPage]);

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
            pageIndex={currentPage}
            paginationAriaLabel={t('myWorkloadView.tasks.paginationAriaLabel')}
            siblingCount={2}
          />
        </div>
      )}
    </>
  );
};

export default MyWorkloadTasks;
