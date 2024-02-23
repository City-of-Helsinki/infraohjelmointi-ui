import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import ConstructionProgramTableHeader from './ConstructionProgramTableHeader';
import { getReportRows } from '@/utils/reportHelpers';
import TableRow from './TableRow';
import { IBasicReportData, ReportType } from '@/interfaces/reportInterfaces';
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
        {tableHeader}
        {reportRows?.map((r, i) => (
          <TableRow key={r.id ?? i} row={r} depth={0} reportType={reportType}/>
        ))}
      </View>
    </View>
  );
};

export default memo(ReportTable);