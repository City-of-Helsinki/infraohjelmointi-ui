import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const cellStyles = {
  width: '40px',
  textAlign: 'left' as unknown as 'left',
  marginRight: '4px',
  marginLeft: '8px',
};

const styles = StyleSheet.create({
  tableHeader: {
    paddingTop: '4px',
    paddingBottom: '4px',
    backgroundColor: '#0000bf',
    fontSize: '8px',
    fontWeight: 500,
    color: 'white',
  },
  tableHeaderRow: {
    flexDirection: 'row',
  },
  firstCellsWrapper: {
    width: '318px',
    marginLeft: '21px',
  },
  targetCell: {
    ...cellStyles,
    marginLeft: '21px',
    marginRight: '15px',
    width: '115px',
  },
  contentCell: {
    ...cellStyles,
    width: '70px',
    marginRight: '15px',
  },
  divisionCell: {
    ...cellStyles,
    width: '70px',
    marginRight: '15px',
  },
  cell: {
    ...cellStyles,
  },
  costForecastCell: {
    ...cellStyles,
    width: '71px',
  },
  planAndConStartCell: {
    ...cellStyles,
    width: '99px',
  },
  previouslyUsedCell: {
    ...cellStyles,
    width: '63px',
  },
  lastCell: {
    ...cellStyles,
    marginRight: '21px',
  },
});

const ConstructionProgramTableHeader = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.tableHeader}>
      {/* Row 1 */}
      <View style={styles.tableHeaderRow}>
        <Text style={styles.targetCell}>{t('target')}</Text>
        <Text style={styles.contentCell}>{t('content')}</Text>
        <Text style={styles.divisionCell}>{t('division')}</Text>
        <Text style={styles.costForecastCell}>{t('costForecast')}</Text>
        <Text style={styles.planAndConStartCell}>{t('planningAnd')}</Text>
        <Text style={styles.previouslyUsedCell}>{t('previouslyUsed')}</Text>
        <Text style={styles.cell}>TAE {'2023'}</Text>
        <Text style={styles.cell}>TSE {'2024'}</Text>
        <Text style={styles.lastCell}>TSE {'2025'}</Text>
      </View>
      {/* Row 2 */}
      <View style={styles.tableHeaderRow}>
        <Text style={styles.firstCellsWrapper} />
        <Text style={styles.costForecastCell}>{t('millionEuro')}</Text>
        <Text style={styles.planAndConStartCell}>{t('constructionTiming')}</Text>
        <Text style={styles.previouslyUsedCell}>{t('millionEuro')}</Text>
        <Text style={styles.cell}>{t('millionEuro')}</Text>
        <Text style={styles.cell}>{t('millionEuro')}</Text>
        <Text style={styles.lastCell}>{t('millionEuro')}</Text>
      </View>
    </View>
  );
};

export default memo(ConstructionProgramTableHeader);
