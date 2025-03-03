import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import ConstructionProgramTableHeader from './reportHeaders/ConstructionProgramTableHeader';
import {
  convertToReportRows,
  flattenBudgetBookSummaryTableRows,
  flattenStrategyTableRows,
  flattenOperationalEnvironmentAnalysisTableRows,
  flattenConstructionProgramTableRows,
  operationalEnvironmentAnalysisTableRows
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
import BudgetBookSummaryTableHeader from './reportHeaders/BudgetBookSummaryTableHeader';
import StrategyTableHeader from './reportHeaders/StrategyTableHeader';
import OperationalEnvironmentAnalysisTableHeader from './reportHeaders/OperationalEnvironmentAnalysisTableHeader';
import OperationalEnvironmentCategorySummary from './OperationalEnvironmentCategorySummary';
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
  projectsInWarrantyPhase
}) => {
  const { t } = useTranslation();
  const reportRows = convertToReportRows(data.rows, reportType, data.categories, t, data.divisions, data.subDivisions, projectsInWarrantyPhase);

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
    flattenStrategyTableRows(reportRows) : [];

  const getTableHeader = () => {
    switch (reportType) {
      case Reports.OperationalEnvironmentAnalysis:
        return <OperationalEnvironmentAnalysisTableHeader />
      case Reports.Strategy:
      case Reports.StrategyForcedToFrame:
        return <StrategyTableHeader />;
      case Reports.ConstructionProgram:
        return <ConstructionProgramTableHeader />;
      case Reports.BudgetBookSummary:
        return <BudgetBookSummaryTableHeader />;
    }
  }

  const buildSummaryRows = () => {
    return operationalEnvironmentAnalysisTableRows(reportRows as IOperationalEnvironmentAnalysisTableRow[])
  }

  const tableHeader = getTableHeader();

  return (
    <View>
      <View style={styles.table}>
        {
          reportType === Reports.OperationalEnvironmentAnalysis && <OperationalEnvironmentCategorySummary rows={buildSummaryRows()} />
        }
        <View fixed>{tableHeader}</View>
        <TableRow reportType={reportType} flattenedRows={
          reportType === Reports.Strategy || reportType === Reports.StrategyForcedToFrame ?
            strategyReportRows : flattenedRows
        }/>
      </View>
    </View>
  );
};

export default memo(ReportTable);
