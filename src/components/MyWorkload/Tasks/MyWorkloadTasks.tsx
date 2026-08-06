import { FC } from 'react';
import MyWorkloadTaskCard from './MyWorkloadTaskCard';
import { useTranslation } from 'react-i18next';
import classes from '../styles.module.css';
import { MyWorkloadTableRow } from '@/interfaces/myWorkloadInterfaces';

interface MyWorkloadTasksProps {
  listOfTasks: MyWorkloadTableRow[];
}

const MyWorkloadTasks: FC<MyWorkloadTasksProps> = ({ listOfTasks }) => {
  const { t } = useTranslation();

  const dateTextFormatter = (startDate: string, endDate: string): string => {
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

  // Todo: Find out where the task description = the action button text comes from
  const tasks = listOfTasks.map((project) => ({
    id: project.id,
    budget: project.budget ?? '',
    projectName: project.projectName,
    planningPeriod: dateTextFormatter(project.planningStart, project.planningEnd),
    constructionPeriod: dateTextFormatter(project.constructionStart, project.constructionEnd),
    constructionProcurementMethod: constructionProcurementMethodTextFormatter(
      project.constructionProcurementMethod,
    ),
    taskDescription: t('myWorkloadView.tasks.taskDescription', {
      projectName: project.projectName,
    }),
  }));

  return (
    <>
      <h2 className={`${classes.sectionTitle} text-heading-m`}>
        {t('myWorkloadView.tasks.title')}
      </h2>
      <ul className={classes.taskList}>
        {tasks.map((task) => (
          <li key={task.id} className={classes.taskListItem}>
            <MyWorkloadTaskCard task={task} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default MyWorkloadTasks;
