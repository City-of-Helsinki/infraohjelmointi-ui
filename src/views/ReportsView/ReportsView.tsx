import { ReportRow } from '@/components/Report';
import { reports } from '@/interfaces/reportInterfaces';
import { useTranslation } from 'react-i18next';
import { PDFViewer } from '@react-pdf/renderer';
import BudgetProposal from '@/components/Report/Reports/BudgetProposal/BudgetProposal';
import './styles.css';

const ReportsView = () => {
  const { t } = useTranslation();

  return (
    <div className="reports-view" data-testid="reports-view">
      <h1 className="reports-title" data-testid="reports-title">
        {t('report')}
      </h1>

      <PDFViewer style={{ width: '100vw', height: '100vh' }}>
        <BudgetProposal />
      </PDFViewer>
      {reports.map((r) => (
        <ReportRow key={r} type={r} lastUpdated="01.01.2023" />
      ))}
    </div>
  );
};

export default ReportsView;
