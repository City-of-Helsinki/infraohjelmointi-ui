import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './reportHeaders/ConstructionProgramTableHeader';
import {
  flattenBudgetBookSummaryTableRows,
  flattenStrategyTableRows,
  flattenOperationalEnvironmentAnalysisTableRows,
  flattenConstructionProgramTableRows,
  flattenForecastTableRows,
  flattenConstructionProgramForecastTableRows,
} from '@/utils/reportHelpers';
import {
  IBudgetBookSummaryTableRow,
  IConstructionProgramTableRow,
  IOperationalEnvironmentAnalysisTableRow,
  IStrategyAndForecastTableRow,
  ReportType,
  Reports,
} from '@/interfaces/reportInterfaces';
import BudgetBookSummaryTableHeader from './reportHeaders/BudgetBookSummaryTableHeader';
import StrategyAndForecastTableHeader from './reportHeaders/StrategyAndForecastTableHeader';
import OperationalEnvironmentAnalysisTableHeader from './reportHeaders/OperationalEnvironmentAnalysisTableHeader';
import TableRow from './TableRow';
import ConstructionProgramForecastTableHeader from './reportHeaders/ConstructionProgramForecastTableHeader';

const styles = StyleSheet.create({
  table: {
    fontSize: '8px',
    marginTop: '20px',
  },
});

interface IReportTableProps {
  reportType: ReportType;
  reportRows:
    | IBudgetBookSummaryTableRow[]
    | IOperationalEnvironmentAnalysisTableRow[]
    | IStrategyAndForecastTableRow[];
  year?: number;
}

type IReportFlattenedRows =
  | IBudgetBookSummaryTableRow
  | IOperationalEnvironmentAnalysisTableRow
  | IConstructionProgramTableRow;

const getFlattenedRows = (reportRows: IReportFlattenedRows[], reportType: ReportType) => {
  if (reportType === Reports.BudgetBookSummary) {
    return flattenBudgetBookSummaryTableRows(reportRows as IBudgetBookSummaryTableRow[]);
  } else if (
    reportType === Reports.OperationalEnvironmentAnalysis ||
    reportType === Reports.OperationalEnvironmentAnalysisForcedToFrame
  ) {
    return flattenOperationalEnvironmentAnalysisTableRows(
      reportRows as IOperationalEnvironmentAnalysisTableRow[],
    );
  } else if (reportType === Reports.ConstructionProgramForecast) {
    return flattenConstructionProgramForecastTableRows(reportRows);
  } else {
    return flattenConstructionProgramTableRows(reportRows);
  }
};

const getStrategyAndForecastReportRows = (type: ReportType, rows: IReportFlattenedRows[]) => {
  if (type === Reports.Strategy || type === Reports.StrategyForcedToFrame) {
    return flattenStrategyTableRows(rows);
  } else if (type === Reports.ForecastReport) {
    return flattenForecastTableRows(rows);
  }
  return [];
};

const ReportTable: FC<IReportTableProps> = ({
  reportType,
  reportRows,
  year = new Date().getFullYear(),
}) => {
  // We need to use one dimensional data for budgetBookSummary to style the report more easily
  const flattenedRows =
    reportType === Reports.BudgetBookSummary ||
    reportType === Reports.OperationalEnvironmentAnalysis ||
    reportType === Reports.OperationalEnvironmentAnalysisForcedToFrame ||
    reportType === Reports.ConstructionProgram ||
    reportType === Reports.ConstructionProgramForecast ||
    reportType === Reports.ConstructionProgramForcedToFrame
      ? getFlattenedRows(reportRows as IReportFlattenedRows[], reportType)
      : [];

  const strategyAndForecastReportRows = getStrategyAndForecastReportRows(reportType, reportRows);

  const getTableHeader = () => {
    switch (reportType) {
      case Reports.OperationalEnvironmentAnalysis:
      case Reports.OperationalEnvironmentAnalysisForcedToFrame:
        return <OperationalEnvironmentAnalysisTableHeader />;
      case Reports.Strategy:
        return <StrategyAndForecastTableHeader isForecastReport={false} year={year} />;
      case Reports.StrategyForcedToFrame:
        return <StrategyAndForecastTableHeader isForecastReport={false} year={year} />;
      case Reports.ForecastReport:
        return <StrategyAndForecastTableHeader isForecastReport={true} />;
      case Reports.ConstructionProgram:
      case Reports.ConstructionProgramForcedToFrame:
        return <ConstructionProgramTableHeader />;
      case Reports.BudgetBookSummary:
        return <BudgetBookSummaryTableHeader />;
      case Reports.ConstructionProgramForecast:
        return <ConstructionProgramForecastTableHeader />;
    }
  };

  const tableHeader = getTableHeader();

  return (
    <View>
      <View style={styles.table}>
        <View fixed>{tableHeader}</View>
        <TableRow
          reportType={reportType}
          flattenedRows={
            reportType === Reports.Strategy ||
            reportType === Reports.StrategyForcedToFrame ||
            reportType == Reports.ForecastReport
              ? strategyAndForecastReportRows
              : flattenedRows
          }
        />
      </View>
    </View>
  );
};

export default memo(ReportTable);
