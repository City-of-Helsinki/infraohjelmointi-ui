import { ReportRow } from '@/components/Report';
import { reports } from '@/interfaces/reportInterfaces';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import './styles.css';
import { selectIsPlanningLoading } from '@/reducers/planningSlice';
import { setLoading, clearLoading } from '@/reducers/loaderSlice';
import { useEffect } from 'react';

const ReportsView = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isPlanningLoading = useAppSelector(selectIsPlanningLoading);
  const LOADING_DATA_ID = 'loading-data';

  useEffect(() => {
    if (isPlanningLoading) {
      dispatch(setLoading({ text: 'Loading data data', id: LOADING_DATA_ID }));
    } else {
      dispatch(clearLoading(LOADING_DATA_ID));
    }
  }, [isPlanningLoading, dispatch]);

  return (
    <div className="reports-view" data-testid="reports-view">
      <h1 className="reports-title" data-testid="reports-title">
        {t('reports')}
      </h1>
      {reports.map((r) => (
        <ReportRow key={r} type={r} />
      ))}
    </div>
  );
};

export default ReportsView;
