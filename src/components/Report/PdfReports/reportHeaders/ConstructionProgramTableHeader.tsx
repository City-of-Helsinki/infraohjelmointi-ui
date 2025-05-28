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
    borderBottom: '1px solid #808080',
  },
  tableHeaderRow: {
    flexDirection: 'row',
  },
  firstCellsWrapper: {
    width: '328px',
    paddingLeft: '21px',
  },
  targetCell: {
    ...cellStyles,
    paddingLeft: '21px',
    paddingRight: '15px',
    width: '214px',
  },
  divisionCell: {
    ...cellStyles,
    width: '113px',
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
        <Text style={styles.divisionCell}>{t('division')}</Text>
        <Text style={styles.costForecastCell}>{t('costForecast')}</Text>
        <Text style={styles.planAndConStartCell}>{t('planningAnd')}</Text>
        <Text style={styles.previouslyUsedCell}>{t('previouslyUsed')}</Text>
        <Text style={styles.cell}>TA {new Date().getFullYear() + 1}</Text>
        <Text style={styles.cell}>TS {new Date().getFullYear() + 2}</Text>
        <Text style={styles.lastCell}>TS {new Date().getFullYear() + 3}</Text>
      </View>
      {/* Row 2 */}
      <View style={styles.tableHeaderRow}>
        <Text style={styles.firstCellsWrapper} />
        <Text style={styles.costForecastCell}>{t('report.shared.millionEuro')}</Text>
        <Text style={styles.planAndConStartCell}>{t('constructionTiming')}</Text>
        <Text style={styles.previouslyUsedCell}>{t('report.shared.millionEuro')}</Text>
        <Text style={styles.cell}>{t('report.shared.millionEuro')}</Text>
        <Text style={styles.cell}>{t('report.shared.millionEuro')}</Text>
        <Text style={styles.lastCell}>{t('report.shared.millionEuro')}</Text>
      </View>
    </View>
  );
};

export default memo(ConstructionProgramTableHeader);
