import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import { flattenBudgetBookSummaryTableRows, getReportRows } from '@/utils/reportHelpers';
import TableRow from './TableRow';
import { IBasicReportData, IBudgetBookSummaryTableRow, ReportType } from '@/interfaces/reportInterfaces';
import BudgetBookSummaryTableHeader from './BudgetBookSummaryTableHeader';

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
  const reportRows = getReportRows(reportType, data.classes, data.divisions, data.projects);
  // We need to use one dimensional data for budgetBookSummary to style the report easier
  const flattenedRows = reportType === 'budgetBookSummary' ? flattenBudgetBookSummaryTableRows(reportRows as IBudgetBookSummaryTableRow[]) : [];
  
  const getTableHeader = () => {
    switch (reportType) {
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
        { reportType === 'budgetBookSummary' ?
          <TableRow flattenedRows={flattenedRows} depth={0} reportType={reportType}/>
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
