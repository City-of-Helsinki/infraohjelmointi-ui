import { ReportRow } from '@/components/Report';
import { reports } from '@/interfaces/reportInterfaces';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { selectPlanningDivisions } from '@/reducers/locationSlice';
import { selectBatchedForcedToFrameClasses, selectBatchedPlanningClasses } from '@/reducers/classSlice';
import './styles.css';
import { selectIsPlanningLoading, setStartYear } from '@/reducers/planningSlice';
import { setLoading, clearLoading } from '@/reducers/loaderSlice';
import { useEffect } from 'react';

const ReportsView = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // We have to pass classes and locations as props to the react-pdf documents, since they are not wrapped in the redux context
  const divisions = useAppSelector(selectPlanningDivisions);
  const classes = useAppSelector(selectBatchedPlanningClasses);
  const forcedToFrameClasses = useAppSelector(selectBatchedForcedToFrameClasses);
  
  const year = new Date().getFullYear();
  useEffect(() => {
    // Set the timeline to the current year so that the correct year's data is passed to the reports
    dispatch(setStartYear(year))
  }, [])

  const isPlanningLoading = useAppSelector(selectIsPlanningLoading);
  const LOADING_DATA_ID = 'loading-data';

  useEffect(() => {
    if (isPlanningLoading) {
      dispatch(setLoading({ text: 'Loading data data', id: LOADING_DATA_ID }));
    } else {
      dispatch(clearLoading(LOADING_DATA_ID));
    }
  }, [isPlanningLoading]);

  return (
    <div className="reports-view" data-testid="reports-view">
      <h1 className="reports-title" data-testid="reports-title">
        {t('reports')}
      </h1>
      {reports.map((r) => (
        <ReportRow key={r} type={r} divisions={divisions} classes={classes} forcedToFrameClasses={forcedToFrameClasses} />
      ))}
    </div>
  );
};

export default ReportsView;