import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const cellStyles = {
  width: '56px',
  textAlign: 'left' as unknown as 'left',
  paddingRight: '6px',
  paddingLeft: '6px',
  alignItems: 'center' as unknown as 'center',
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
    width: '346px',
    paddingLeft: '21px',
  },
  targetCell: {
    ...cellStyles,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '160px',
  },
  contentCell: {
    ...cellStyles,
    width: '93px',
    paddingRight: '15px',
  },
  divisionCell: {
    ...cellStyles,
    width: '93px',
    paddingRight: '15px',
  },
  cell: {
    ...cellStyles,
  },
  costForecastCell: {
    ...cellStyles,
    width: '83px',
  },
  planAndConStartCell: {
    ...cellStyles,
    width: '111px',
  },
  previouslyUsedCell: {
    ...cellStyles,
    width: '86px',
  },
  lastCell: {
    ...cellStyles,
    paddingRight: '21px',
    width: '72px',
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
