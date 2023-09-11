import { ReportRow } from '@/components/Report';
import { reports } from '@/interfaces/reportInterfaces';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/common';
import { selectPlanningDivisions } from '@/reducers/locationSlice';
import { selectBatchedPlanningClasses } from '@/reducers/classSlice';
import './styles.css';

const ReportsView = () => {
  const { t } = useTranslation();

  // We have to pass classes and locations as props to the react-pdf documents, since they are not wrapped in the redux context
  const divisions = useAppSelector(selectPlanningDivisions);
  const classes = useAppSelector(selectBatchedPlanningClasses);

  return (
    <div className="reports-view" data-testid="reports-view">
      <h1 className="reports-title" data-testid="reports-title">
        {t('reports')}
      </h1>
      {reports.map((r) => (
        <ReportRow
          key={r}
          type={r}
          lastUpdated="01.01.2023"
          divisions={divisions}
          classes={classes}
        />
      ))}
    </div>
  );
};

export default ReportsView;
