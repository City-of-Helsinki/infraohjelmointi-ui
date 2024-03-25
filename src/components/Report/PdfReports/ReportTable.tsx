import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import { convertToReportRows, flattenBudgetBookSummaryTableRows, flattenStrategyTableRows, flattenOperationalEnvironmentAnalysisTableRows, getReportRows } from '@/utils/reportHelpers';
import TableRow from './TableRow';
import { IBasicReportData, IBudgetBookSummaryTableRow, IOperationalEnvironmentAnalysisTableRow, ReportType, Reports } from '@/interfaces/reportInterfaces';
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

const getFlattenedRows = (reportRows: (IBudgetBookSummaryTableRow | IOperationalEnvironmentAnalysisTableRow)[], reportType: ReportType) => {
  if (reportType === Reports.BudgetBookSummary) {
    return flattenBudgetBookSummaryTableRows(reportRows as IBudgetBookSummaryTableRow[]);
  } else {
    return flattenOperationalEnvironmentAnalysisTableRows(reportRows as IOperationalEnvironmentAnalysisTableRow[]);
  }
}

const ReportTable: FC<IConstructionProgramTableProps> = ({
  reportType,
  data
}) => {
  const reportRows = data.coordinatorRows
    ? convertToReportRows(data.coordinatorRows, reportType, data.categories)
    : getReportRows(reportType, data.classes, data.divisions, data.projects);

  // We need to use one dimensional data for budgetBookSummary to style the report more easily
  const flattenedRows = (reportType === Reports.BudgetBookSummary || reportType === Reports.OperationalEnvironmentAnalysis) ? getFlattenedRows(reportRows as (IBudgetBookSummaryTableRow | IOperationalEnvironmentAnalysisTableRow)[], reportType) : [];
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
        { reportType === Reports.BudgetBookSummary || reportType === Reports.Strategy || reportType === Reports.OperationalEnvironmentAnalysis?
          <TableRow flattenedRows={reportType === Reports.BudgetBookSummary || reportType === Reports.OperationalEnvironmentAnalysis ? flattenedRows : strategyReportRows} depth={0} reportType={reportType}/>
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
