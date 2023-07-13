import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { memo } from 'react';

const cellStyles = {
  width: '42px',
  height: '11px',
  fontWeight: 500,
  textAlign: 'center' as unknown as 'center',
};

const styles = StyleSheet.create({
  tableHeader: {
    paddingTop: '6px',
    paddingBottom: '6px',
    backgroundColor: '#0000bf',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    color: 'white',
  },
  cell: {
    ...cellStyles,
  },
  nameCell: {
    ...cellStyles,
    width: '208px',
    paddingLeft: '21px',
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
  preliminaryInvestmentProgramCell: {
    ...cellStyles,
    width: '312px',
  },
  lastCell: {
    ...cellStyles,
    marginRight: '18px',
  },
});

const BudgetProposalTableHeader = () => {
  return (
    <View style={styles.tableHeader}>
      {/* Row 1 */}
      <View style={styles.tableHeaderRow}>
        <Text style={styles.nameCell}>Kohde</Text>
        <Text style={styles.cell}>Kategoria</Text>
        <Text style={styles.costForecastCell}>Kustannus-</Text>
        <Text style={styles.cell}>Työvaihe</Text>
        <Text style={styles.readinessCell}>Valm.</Text>
        <Text style={styles.cell}>TAE</Text>
        <Text style={styles.cell}>TSE</Text>
        <Text style={styles.cell}>TSE</Text>
        <Text style={styles.preliminaryInvestmentProgramCell}>
          Alustava investointiohjelma 2026-2032
        </Text>
      </View>
      {/* Row 2 */}
      <View style={styles.tableHeaderRow}>
        <Text style={styles.nameCell}>Puistot ja liikunta-alueet</Text>
        <Text style={styles.cell}>K1-H5</Text>
        <Text style={styles.costForecastCell}>ennuste</Text>
        <Text style={styles.cell}>2023</Text>
        <Text style={styles.readinessCell}>2022</Text>
        <Text style={styles.cell}>2023</Text>
        <Text style={styles.cell}>2024</Text>
        <Text style={styles.cell}>2025</Text>
        <Text style={styles.cell}>2026</Text>
        <Text style={styles.cell}>2027</Text>
        <Text style={styles.cell}>2028</Text>
        <Text style={styles.cell}>2029</Text>
        <Text style={styles.cell}>2030</Text>
        <Text style={styles.cell}>2031</Text>
        <Text style={styles.lastCell}>2032</Text>
      </View>
      {/* Row 3 */}
      <View style={styles.tableHeaderRow}>
        <Text style={styles.nameCell}></Text>
        <Text style={styles.cell}></Text>
        <Text style={styles.costForecastCell}>1000€</Text>
        <Text style={styles.cell}>(s + r)</Text>
        <Text style={styles.readinessCell}>%</Text>
        <Text style={styles.cell}>1000€</Text>
        <Text style={styles.cell}>1000€</Text>
        <Text style={styles.cell}>1000€</Text>
        <Text style={styles.cell}>1000€</Text>
        <Text style={styles.cell}>1000€</Text>
        <Text style={styles.cell}>1000€</Text>
        <Text style={styles.cell}>1000€</Text>
        <Text style={styles.cell}>1000€</Text>
        <Text style={styles.cell}>1000€</Text>
        <Text style={styles.lastCell}>1000€</Text>
      </View>
    </View>
  );
};

export default memo(BudgetProposalTableHeader);
