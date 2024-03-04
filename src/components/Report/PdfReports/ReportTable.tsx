import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import { convertToReportRows, flattenBudgetBookSummaryTableRows, flattenStrategyTableRows, getReportRows } from '@/utils/reportHelpers';
import TableRow from './TableRow';
import { IBasicReportData, IBudgetBookSummaryTableRow, ReportType, Reports } from '@/interfaces/reportInterfaces';
import BudgetBookSummaryTableHeader from './BudgetBookSummaryTableHeader';
import StrategyTableHeader from './StrategyTableHeader';
import OperationalEnvironmentAnalysisTableHeader from './OperationalEnvironmentAnalysisTableHeader';

const styles = StyleSheet.create({
  table: {
    fontSize: '8px',
    marginTop: '20px',
  },
});

interface IConstructionProgramTableProps {
  reportType: ReportType;
  data: IBasicReportData;
}

const ReportTable: FC<IConstructionProgramTableProps> = ({
  reportType,
  data
}) => {
  const reportRows = data.coordinatorRows
    ? convertToReportRows(data.coordinatorRows, reportType)
    : getReportRows(reportType, data.classes, data.divisions, data.projects);

  // We need to use one dimensional data for budgetBookSummary to style the report more easily
  const flattenedRows = reportType === Reports.BudgetBookSummary ? flattenBudgetBookSummaryTableRows(reportRows as IBudgetBookSummaryTableRow[]) : [];
  const strategyReportRows = reportType === Reports.Strategy ? flattenStrategyTableRows(reportRows) : [];
  const getTableHeader = () => {
    switch (reportType) {
      case Reports.Strategy:
        return <StrategyTableHeader />;
      case Reports.ConstructionProgram:
        return <ConstructionProgramTableHeader />;
      case Reports.BudgetBookSummary:
        return <BudgetBookSummaryTableHeader />;
      case Reports.OperationalEnvironmentAnalysis:
        return <OperationalEnvironmentAnalysisTableHeader />
    }
  }
  const tableHeader = getTableHeader();
  return (
    <View>
      <View style={styles.table}>
        <View fixed>{tableHeader}</View>
        { reportType === Reports.BudgetBookSummary || reportType === Reports.Strategy ?
          <TableRow flattenedRows={reportType === Reports.BudgetBookSummary ? flattenedRows : strategyReportRows} depth={0} reportType={reportType}/>
        :
        reportRows?.map((r, i) => (
          <TableRow key={r.id ?? i} row={r} index={i} depth={0} reportType={reportType}/>
        ))
        }
      </View>
    </View>
  );
};

export default memo(ReportTable);
