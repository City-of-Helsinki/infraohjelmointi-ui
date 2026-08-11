import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './styles.module.css';

const MyWorkloadTasks: FC = () => {
  const { t } = useTranslation();
  const [tasks] = useState([]);
  const hasTasks = tasks && tasks.length > 0;

  return (
    <>
      {hasTasks && (
        <h2 className={`${classes.sectionTitle} text-heading-m`}>{t('myWorkloadView.tasks')}</h2>
      )}
    </>
  );
};

export default MyWorkloadTasks;
