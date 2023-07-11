import { ReportRow } from '@/components/Report';
import { reports } from '@/interfaces/common';
import { useTranslation } from 'react-i18next';
import './styles.css';

const ReportsView = () => {
  const { t } = useTranslation();

  return (
    <div className="reports-view" data-testid="reports-view">
      <h1 className="reports-title" data-testid="reports-title">
        {t('reportsTitle')}
      </h1>
      {reports.map((r) => (
        <ReportRow key={r} type={r} lastUpdated="01.01.2023" />
      ))}
    </div>
  );
};

export default ReportsView;
