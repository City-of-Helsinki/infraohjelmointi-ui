import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import { convertToReportRows, flattenBudgetBookSummaryTableRows, flattenStrategyTableRows, flattenOperationalEnvironmentAnalysisTableRows, flattenConstructionProgramTableRows } from '@/utils/reportHelpers';
import TableRow from './TableRow';
import { IBasicReportData, IBudgetBookSummaryTableRow, IConstructionProgramTableRow, IOperationalEnvironmentAnalysisTableRow, ReportType, Reports } from '@/interfaces/reportInterfaces';
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

const getFlattenedRows = (reportRows: (IBudgetBookSummaryTableRow | IOperationalEnvironmentAnalysisTableRow | IConstructionProgramTableRow)[], reportType: ReportType) => {
  if (reportType === Reports.BudgetBookSummary) {
    return flattenBudgetBookSummaryTableRows(reportRows as IBudgetBookSummaryTableRow[]);
  } else if (reportType === Reports.OperationalEnvironmentAnalysis) {
    return flattenOperationalEnvironmentAnalysisTableRows(reportRows as IOperationalEnvironmentAnalysisTableRow[]);
  } else {
    return flattenConstructionProgramTableRows(reportRows);
  }
}

const ReportTable: FC<IConstructionProgramTableProps> = ({
  reportType,
  data
}) => {
  const reportRows = convertToReportRows(data.rows, reportType, data.categories);

  // We need to use one dimensional data for budgetBookSummary to style the report more easily
  const flattenedRows = (reportType === Reports.BudgetBookSummary || reportType === Reports.OperationalEnvironmentAnalysis || reportType === Reports.ConstructionProgram) ? getFlattenedRows(reportRows as (IBudgetBookSummaryTableRow | IOperationalEnvironmentAnalysisTableRow | IConstructionProgramTableRow)[], reportType) : [];
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
        <TableRow flattenedRows={reportType === Reports.Strategy ? strategyReportRows : flattenedRows} reportType={reportType}/>
      </View>
    </View>
  );
};

export default memo(ReportTable);
