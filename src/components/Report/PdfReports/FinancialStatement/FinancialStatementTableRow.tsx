import { IFinancialStatementTableRow } from '@/interfaces/reportInterfaces';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

const cellStyles = {
  width: '56px',
  textAlign: 'left' as unknown as 'left',
  paddingRight: '6px',
  paddingTop: '4px',
  paddingBottom: '4px',
  paddingLeft: '6px',
  alignItems: 'center' as unknown as 'center',
  height: '100%',
};

const tableRowStyles = {
  fontSize: '8px',
  fontWeight: 'normal' as unknown as 'normal',
  flexDirection: 'row' as unknown as 'row',
  alignItems: 'center' as unknown as 'center',
};

const styles = StyleSheet.create({
  oddRow: {
    ...tableRowStyles,
    display: 'flex',
    justifyContent: 'space-between',
  },
  evenRow: {
    ...tableRowStyles,
    backgroundColor: '#efeff0',
    display: 'flex',
    justifyContent: 'space-between',
  },
  cell: {
    ...cellStyles,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '100%',
  },
  classNameView: {
    ...tableRowStyles,
    paddingTop: '10px',
  },
  classNameCell: {
    ...cellStyles,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '214px',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  costForecastCell: {
    ...cellStyles,
    width: '83px',
  },
});

interface IFinancialStatementTableRowProps {
  row: IFinancialStatementTableRow;
  index?: number;
}

const ClassNameRow: FC<IFinancialStatementTableRowProps> = memo(({ row }) => {
  return (
    <View style={styles.classNameView} key={row.id}>
      <Text style={styles.classNameCell}>{row.name}</Text>
      <Text style={styles.costForecastCell}>{row.costForecast}</Text>
    </View>
  );
});

ClassNameRow.displayName = 'Row';

const ProjectRow: FC<IFinancialStatementTableRowProps> = memo(({ row, index }) => {
  const { t } = useTranslation();
  return (
    <View style={index && index % 2 ? styles.evenRow : styles.oddRow} key={row.id}>
      <Text style={styles.cell}>{row.name}</Text>
      <Text style={styles.costForecastCell}>{row.costForecast} {t('report.financialStatement.amount')}</Text>
    </View>
  );
});
ProjectRow.displayName = 'Row';

const FinancialStatementTableRow: FC<IFinancialStatementTableRowProps> = ({ row }) => {
  return (
    <>
      {/* Class */}
      <ClassNameRow row={row} />
      {/* Projects for class */}
      {row.projects?.map((p, index) => (
        <ProjectRow key={p.id} row={p} index={index}/>
      ))}
      {/* Iterate children recursively */}
      {row.children?.map((r) => (
        <FinancialStatementTableRow key={r.id} row={r} />
      ))}
    </>
  );
};

export default memo(FinancialStatementTableRow);
