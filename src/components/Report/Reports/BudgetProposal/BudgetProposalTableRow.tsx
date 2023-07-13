import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { memo } from 'react';

const cellStyles = {
  width: '42px',
  fontWeight: 500,
  padding: '4px',
  height: '20px',
  borderRight: '1px solid #808080',
  textAlign: 'center' as unknown as 'center',
};

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
  },
  nameCell: {
    ...cellStyles,
    width: '208px',
    paddingLeft: '21px',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  costForecastCell: {
    ...cellStyles,
    width: '50px',
  },
  readinessCell: {
    ...cellStyles,
    width: '34px',
  },
  cell: {
    ...cellStyles,
  },
  lastCell: {
    ...cellStyles,
    marginRight: '18px',
    borderRight: 0,
  },
});

const BudgetProposalTableRow = () => {
  return (
    <View style={styles.tableRow}>
      <Text style={styles.nameCell}>8 04 Puistot ja liikunta-alueet</Text>
      <Text style={styles.cell}>K5.1</Text>
      <Text style={styles.costForecastCell}>290 000</Text>
      <Text style={styles.cell}>s</Text>
      <Text style={styles.readinessCell}>10%</Text>
      <Text style={styles.cell}>200 000</Text>
      <Text style={styles.cell}>210 000</Text>
      <Text style={styles.cell}>220 000</Text>
      <Text style={styles.cell}>230 000</Text>
      <Text style={styles.cell}>240 000</Text>
      <Text style={styles.cell}>250 000</Text>
      <Text style={styles.cell}>260 000</Text>
      <Text style={styles.cell}>270 000</Text>
      <Text style={styles.cell}>280 000</Text>
      <Text style={styles.lastCell}>290 000</Text>
    </View>
  );
};

export default memo(BudgetProposalTableRow);
