import { FC, useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/common';
import { selectUser } from '@/reducers/authSlice';
import { selectResponsiblePersonsRaw } from '@/reducers/listsSlice';
import { selectStartYear } from '@/reducers/planningSlice';
import useMyWorkloadRows, { MyWorkloadViewType } from './useMyWorkloadRows';
import { getMyWorkloadViewType } from './myWorkloadUtils';
import { useTranslation } from 'react-i18next';
import { isRequestCanceled } from '@/utils/http';
import classes from './styles.module.css';
import MyWorkloadTasks from './MyWorkloadTasks';
import MyWorkloadTable from './MyWorkloadTable';
import MyWorkloadViewTypeButtons from './MyWorkloadViewTypeButtons';

const MyWorkloadBaseView: FC = () => {
  const [viewType, setViewType] = useState<MyWorkloadViewType>('planning');
  const [isResolvingViewType, setIsResolvingViewType] = useState(true);
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const responsiblePersons = useAppSelector(selectResponsiblePersonsRaw);
  const startYear = useAppSelector(selectStartYear);
  const {
    rows: listOfProjects,
    isLoading,
    hasError,
  } = useMyWorkloadRows(viewType, !isResolvingViewType);

  useEffect(() => {
    const abortController = new AbortController();
    let isActive = true;

    setIsResolvingViewType(true);

    const resolveViewType = async () => {
      try {
        const resolvedViewType = await getMyWorkloadViewType(
          user,
          startYear,
          abortController.signal,
          responsiblePersons,
        );

        if (isActive) {
          setViewType(resolvedViewType);
        }
      } catch (e) {
        if (isRequestCanceled(e)) {
          return;
        }

        if (isActive) {
          setViewType('planning');
        }
      } finally {
        if (isActive) {
          setIsResolvingViewType(false);
        }
      }
    };

    resolveViewType();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [responsiblePersons, startYear, user]);
  const isTableLoading = isResolvingViewType || isLoading;

  const showConstructionTasks = viewType === 'construction';

  return (
    <div id="construction-my-workload-base-view" className={classes.contentContainer}>
      <h1 className={`${classes.mainTitle} text-heading-xl`}>{t('myWorkloadView.mainTitle')}</h1>
      <MyWorkloadViewTypeButtons viewType={viewType} setViewType={setViewType} />
      {showConstructionTasks && <MyWorkloadTasks />}
      <MyWorkloadTable
        listOfProjects={listOfProjects}
        isLoading={isTableLoading}
        hasError={hasError}
        viewType={viewType}
      />
    </div>
  );
};

export default MyWorkloadBaseView;
