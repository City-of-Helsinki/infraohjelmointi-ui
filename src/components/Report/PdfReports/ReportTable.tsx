import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import { convertToReportRows, flattenBudgetBookSummaryTableRows, flattenStrategyTableRows, getReportRows } from '@/utils/reportHelpers';
import TableRow from './TableRow';
import { IBasicReportData, IBudgetBookSummaryTableRow, ReportType } from '@/interfaces/reportInterfaces';
import BudgetBookSummaryTableHeader from './BudgetBookSummaryTableHeader';
import StrategyTableHeader from './StrategyTableHeader';

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
  const flattenedRows = reportType === 'budgetBookSummary' ? flattenBudgetBookSummaryTableRows(reportRows as IBudgetBookSummaryTableRow[]) : [];
  const strategyReportRows = reportType === 'strategy' ? flattenStrategyTableRows(reportRows) : [];
  
  const getTableHeader = () => {
    switch (reportType) {
      case 'strategy':
        return <StrategyTableHeader />;
      case 'constructionProgram':
        return <ConstructionProgramTableHeader />;
      case 'budgetBookSummary':
        return <BudgetBookSummaryTableHeader />;
    }
  }
  const tableHeader = getTableHeader();
  return (
    <View>
      <View style={styles.table}>
        <View fixed>{tableHeader}</View>
        { reportType === 'budgetBookSummary' || reportType === 'strategy' ?
          <TableRow flattenedRows={reportType === 'budgetBookSummary' ? flattenedRows : strategyReportRows} depth={0} reportType={reportType}/>
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
