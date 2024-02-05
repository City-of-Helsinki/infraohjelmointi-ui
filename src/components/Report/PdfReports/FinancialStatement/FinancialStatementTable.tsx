import { FC, memo } from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import { IProject } from '@/interfaces/projectInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import { getReportRows } from '@/utils/reportHelpers';
import FinancialStatementTableRow from './FinancialStatementTableRow';

const styles = StyleSheet.create({
  table: {
    fontSize: '8px',
    marginTop: '20px',
  },
});

interface IFinancialStatementTableProps {
  projects: Array<IProject>;
  divisions: Array<ILocation>;
  classes: IClassHierarchy;
}

const FinancialStatementTable: FC<IFinancialStatementTableProps> = ({
  projects,
  divisions,
  classes,
}) => {
  const reportRows = getReportRows(projects, classes, divisions);

  return (
    <View>
      <View style={styles.table}>
        {reportRows.map((r, i) => (
          <FinancialStatementTableRow key={i} row={r} />
        ))}
      </View>
    </View>
  );
};

export default memo(FinancialStatementTable);
