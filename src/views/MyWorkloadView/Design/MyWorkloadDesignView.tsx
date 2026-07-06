import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import MyWorkloadTable from '../shared/MyWorkloadTable';
import MyWorkloadTasks from '../shared/MyWorkloadTasks';
import useMyWorkloadRows from '../shared/useMyWorkloadRows';
import classes from '../styles.module.css';

const MyWorkloadDesignView: FC = () => {
  const { t } = useTranslation();
  const { rows: listOfProjects, isLoading, hasError } = useMyWorkloadRows('design');

  return (
    <div id="design-my-workload-base-view" className={classes.contentContainer}>
      <h1 className={`${classes.mainTitle} text-heading-xl`}>{t('myWorkloadView.mainTitle')}</h1>
      <MyWorkloadTasks />
      <MyWorkloadTable listOfProjects={listOfProjects} isLoading={isLoading} hasError={hasError} />
    </div>
  );
};

export default MyWorkloadDesignView;
