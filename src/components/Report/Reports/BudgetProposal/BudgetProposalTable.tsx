import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { memo } from 'react';

const headerCellStyles = {
  //   borderLeft: 0,
  width: '42px',
  height: '11px',
  fontSize: '8px',
  margin: 0,
  borderLeft: '1px solid red',
  borderRight: '1px solid red',
  fontWeight: 500,
  display: 'flex' as unknown as 'flex',
  textAlign: 'center' as unknown as 'center',
  alignItems: 'center' as unknown as 'center',
  justifyContent: 'center' as unknown as 'center',
};

const cellStyles = {
  ...headerCellStyles,
  padding: '4px',
  height: '20px',
  borderRight: '1px solid #808080',
  borderBottom: '1px solid #808080',
};

const styles = StyleSheet.create({
  table: {
    borderWidth: '1px',
    borderColor: '#808080',
    borderBottom: 0,
  },
  tableTitle: {
    fontWeight: 500,
    marginBottom: '12px',
  },
  tableHeaderContainer: {
    paddingTop: '6px',
    paddingBottom: '6px',
    backgroundColor: '#0000bf',
  },
  tableHeader: {
    flexDirection: 'row',
    color: 'white',
  },
  headerCell: {
    ...headerCellStyles,
  },
  headerNameCell: {
    ...headerCellStyles,
    width: '208px',
    paddingLeft: '21px',
    textAlign: 'left',
    display: 'flex',
  },
  headerCostForecastCell: {
    ...headerCellStyles,
    width: '50px',
  },
  headerReadinessCell: {
    ...headerCellStyles,
    width: '34px',
  },
  lastHeaderCellFirstRow: {
    ...headerCellStyles,
    width: '400px',
  },
  lastHeaderCell: {
    ...headerCellStyles,
    width: '60px',
  },
  tableContent: {
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
  tableCell: {
    ...cellStyles,
  },
  lastCell: {
    ...cellStyles,
    width: '60px',
    paddingRight: '20px',
    borderRight: 0,
  },
});

const BudgetProposalTable = () => {
  return (
    <View>
      <Text style={styles.tableTitle}>
        Talousarvioehdotus 2023 & taloussuunnitelmaehdotus 2024-2025 & alustava investointiohjelma
        2026-2032
      </Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerNameCell}>Kohde</Text>
            <Text style={styles.headerCell}>Kategoria</Text>
            <Text style={styles.headerCostForecastCell}>Kustannus-</Text>
            <Text style={styles.headerCell}>Työvaihe</Text>
            <Text style={styles.headerReadinessCell}>Valm.</Text>
            <Text style={styles.headerCell}>TAE</Text>
            <Text style={styles.headerCell}>TSE</Text>
            <Text style={styles.headerCell}>TSE</Text>
            <Text style={styles.lastHeaderCellFirstRow}>Alustava investointiohjelma 2026-2032</Text>
          </View>
          <View style={styles.tableHeader}>
            <Text style={styles.headerNameCell}>Puistot ja liikunta-alueet</Text>
            <Text style={styles.headerCell}>K1-H5</Text>
            <Text style={styles.headerCostForecastCell}>ennuste</Text>
            <Text style={styles.headerCell}>2023</Text>
            <Text style={styles.headerCell}>2022</Text>
            <Text style={styles.headerCell}>2023</Text>
            <Text style={styles.headerCell}>2024</Text>
            <Text style={styles.headerCell}>2025</Text>
            <Text style={styles.headerCell}>2026</Text>
            <Text style={styles.headerCell}>2027</Text>
            <Text style={styles.headerCell}>2028</Text>
            <Text style={styles.headerCell}>2029</Text>
            <Text style={styles.headerCell}>2030</Text>
            <Text style={styles.headerCell}>2031</Text>
            <Text style={styles.lastHeaderCell}>2032</Text>
          </View>
          <View style={styles.tableHeader}>
            <Text style={styles.headerNameCell}></Text>
            <Text style={styles.headerCell}></Text>
            <Text style={styles.headerCostForecastCell}>1000€</Text>
            <Text style={styles.headerCell}>(s + r)</Text>
            <Text style={styles.headerReadinessCell}>%</Text>
            <Text style={styles.headerCell}>1000€</Text>
            <Text style={styles.headerCell}>1000€</Text>
            <Text style={styles.headerCell}>1000€</Text>
            <Text style={styles.headerCell}>1000€</Text>
            <Text style={styles.headerCell}>1000€</Text>
            <Text style={styles.headerCell}>1000€</Text>
            <Text style={styles.headerCell}>1000€</Text>
            <Text style={styles.headerCell}>1000€</Text>
            <Text style={styles.headerCell}>1000€</Text>
            <Text style={styles.lastHeaderCell}>1000€</Text>
          </View>
        </View>
        <View style={styles.tableContent}>
          <Text style={styles.nameCell}>8 04 Puistot ja liikunta-alueet</Text>
          <Text style={styles.tableCell}>K5.1</Text>
          <Text style={styles.costForecastCell}>290 000</Text>
          <Text style={styles.tableCell}>s</Text>
          <Text style={styles.readinessCell}>10%</Text>
          <Text style={styles.tableCell}>200 000</Text>
          <Text style={styles.tableCell}>210 000</Text>
          <Text style={styles.tableCell}>220 000</Text>
          <Text style={styles.tableCell}>230 000</Text>
          <Text style={styles.tableCell}>240 000</Text>
          <Text style={styles.tableCell}>250 000</Text>
          <Text style={styles.tableCell}>260 000</Text>
          <Text style={styles.tableCell}>270 000</Text>
          <Text style={styles.tableCell}>280 000</Text>
          <Text style={styles.lastCell}>290 000</Text>
        </View>
      </View>
    </View>
  );
};

export default memo(BudgetProposalTable);
