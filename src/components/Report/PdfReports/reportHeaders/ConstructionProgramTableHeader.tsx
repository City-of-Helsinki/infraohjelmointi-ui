import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { memo } from 'react';
import { t } from 'i18next';

const cellStyles = {
  width: '56px',
  textAlign: 'left' as unknown as 'left',
  paddingRight: '6px',
  paddingLeft: '6px',
  alignItems: 'flex-start' as unknown as 'flex-start',
};

const styles = StyleSheet.create({
  tableHeader: {
    paddingTop: '4px',
    paddingBottom: '4px',
    backgroundColor: '#0000bf',
    width: '100%',
    fontSize: '8px',
    fontWeight: 500,
    color: 'white',
    borderBottom: '1px solid #808080',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    width: '100%',
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
    width: '10%',
    flexShrink: 0,
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
  const [costForecastTitle, costForecastContinuation] = t('costForecast').split('\n');

  return (
    <View style={styles.tableHeader}>
      {/* Each column stacks its own lines so a wrapped title doesn't push other columns' second line down */}
      <View style={styles.tableHeaderRow}>
        <View style={styles.targetCell}>
          <Text>{t('target')}</Text>
        </View>
        <View style={styles.divisionCell}>
          <Text>{t('division')}</Text>
        </View>
        <View style={styles.costForecastCell}>
          <Text>{costForecastTitle}</Text>
          <Text>{costForecastContinuation || t('report.shared.millionEuro')}</Text>
        </View>
        <View style={styles.planAndConStartCell}>
          <Text>{t('planningAnd')}</Text>
          <Text>{t('constructionTiming')}</Text>
        </View>
        <View style={styles.previouslyUsedCell}>
          <Text>{t('previouslyUsed')}</Text>
          <Text>{t('report.shared.millionEuro')}</Text>
        </View>
        <View style={styles.cell}>
          <Text>TA {new Date().getFullYear() + 1}</Text>
          <Text>{t('report.shared.millionEuro')}</Text>
        </View>
        <View style={styles.cell}>
          <Text>TS {new Date().getFullYear() + 2}</Text>
          <Text>{t('report.shared.millionEuro')}</Text>
        </View>
        <View style={styles.lastCell}>
          <Text>TS {new Date().getFullYear() + 3}</Text>
          <Text>{t('report.shared.millionEuro')}</Text>
        </View>
      </View>
    </View>
  );
};

export default memo(ConstructionProgramTableHeader);
