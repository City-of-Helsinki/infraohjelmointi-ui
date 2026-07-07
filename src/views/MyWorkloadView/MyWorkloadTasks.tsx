import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './styles.module.css';

const MyWorkloadTasks: FC = () => {
  const { t } = useTranslation();

  return <h2 className={`${classes.sectionTitle} text-heading-m`}>{t('myWorkloadView.tasks')}</h2>;
};

export default MyWorkloadTasks;
