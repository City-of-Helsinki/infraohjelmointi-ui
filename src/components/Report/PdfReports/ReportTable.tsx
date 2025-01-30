import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import {
  convertToReportRows,
  flattenBudgetBookSummaryTableRows,
  flattenStrategyTableRows,
  flattenOperationalEnvironmentAnalysisTableRows,
  flattenConstructionProgramTableRows,
  flattenForecastTableRows
} from '@/utils/reportHelpers';
import {
  IBasicReportData,
  IBudgetBookSummaryTableRow,
  IConstructionProgramTableRow,
  IOperationalEnvironmentAnalysisTableRow,
  ReportType,
  Reports
} from '@/interfaces/reportInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import BudgetBookSummaryTableHeader from './BudgetBookSummaryTableHeader';
import StrategyTableHeader from './StrategyTableHeader';
import OperationalEnvironmentAnalysisTableHeader from './OperationalEnvironmentAnalysisTableHeader';
import TableRow from './TableRow';

const styles = StyleSheet.create({
  table: {
    fontSize: '8px',
    marginTop: '20px',
  },
});

interface IReportTableProps {
  reportType: ReportType;
  data: IBasicReportData;
  projectsInWarrantyPhase?: IProject[];
  hierarchyInForcedToFrame?: IPlanningRow[];
}

const getFlattenedRows = (
  reportRows: (IBudgetBookSummaryTableRow | IOperationalEnvironmentAnalysisTableRow | IConstructionProgramTableRow)[],
  reportType: ReportType
) => {
  if (reportType === Reports.BudgetBookSummary) {
    return flattenBudgetBookSummaryTableRows(reportRows as IBudgetBookSummaryTableRow[]);
  } else if (reportType === Reports.OperationalEnvironmentAnalysis) {
    return flattenOperationalEnvironmentAnalysisTableRows(reportRows as IOperationalEnvironmentAnalysisTableRow[]);
  } else {
    return flattenConstructionProgramTableRows(reportRows);
  }
}

const ReportTable: FC<IReportTableProps> = ({
  reportType,
  data,
  projectsInWarrantyPhase,
  hierarchyInForcedToFrame
}) => {
  const { t } = useTranslation();
  const reportRows = convertToReportRows(data.rows, reportType, data.categories, t, data.divisions, data.subDivisions, projectsInWarrantyPhase, hierarchyInForcedToFrame);

  // We need to use one dimensional data for budgetBookSummary to style the report more easily
  const flattenedRows = (
    reportType === Reports.BudgetBookSummary ||
    reportType === Reports.OperationalEnvironmentAnalysis ||
    reportType === Reports.ConstructionProgram)
      ? getFlattenedRows(
        reportRows as (IBudgetBookSummaryTableRow | IOperationalEnvironmentAnalysisTableRow | IConstructionProgramTableRow)[]
        , reportType
  ) : [];

  const strategyReportRows = reportType === Reports.Strategy || reportType === Reports.StrategyForcedToFrame ?
    flattenStrategyTableRows(reportRows) : reportType === Reports.ForecastReport ?
    flattenForecastTableRows(reportRows) : [];

  const getTableHeader = () => {
    switch (reportType) {
      case Reports.OperationalEnvironmentAnalysis:
        return <OperationalEnvironmentAnalysisTableHeader />
      case Reports.Strategy:
      case Reports.StrategyForcedToFrame:
        return <StrategyTableHeader isForecastReport={false}/>;
      case Reports.ForecastReport:
        return <StrategyTableHeader isForecastReport={true} />;
      case Reports.ConstructionProgram:
        return <ConstructionProgramTableHeader />;
      case Reports.BudgetBookSummary:
        return <BudgetBookSummaryTableHeader />;
    }
  }

  const tableHeader = getTableHeader();
  return (
    <View>
      <View style={styles.table}>
        <View fixed>{tableHeader}</View>
        <TableRow reportType={reportType} flattenedRows={
          reportType === Reports.Strategy || reportType === Reports.StrategyForcedToFrame || reportType == Reports.ForecastReport ?
            strategyReportRows : flattenedRows
        }/>
      </View>
    </View>
  );
};

export default memo(ReportTable);
