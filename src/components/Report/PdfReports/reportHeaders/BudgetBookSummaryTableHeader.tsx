import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const styles = StyleSheet.create({
  tableHeader: {
    paddingTop: '4px',
    paddingBottom: '4px',
    backgroundColor: '#0000bf',
    fontSize: '8px',
    fontWeight: 500,
    color: 'white',
    flexDirection: 'row',
  },
  tableHeaderRow: {
    flexDirection: 'row',
  },
  targetCell: {
    width: '26%',
    paddingLeft: '8px',
  },
  narrowerColumns: {
    alignItems: 'center' as unknown as 'center',
    width: '5%',
  },
  widerColumns: {
    alignItems: 'center' as unknown as 'center',
    width: '7%',
  },
});

const BudgetBookSummaryTableHeader = () => {
  const { t } = useTranslation();
  // This is used for looping the inital budgets for 5-10 years from now on
  const currentPlusYears = [5, 6, 7, 8, 9, 10];
  return (
    <View style={styles.tableHeader}>
        <Text style={styles.targetCell}>{t('target')}</Text>
        <View style={styles.narrowerColumns}>
            <Text>{t('usage')}</Text>
            <Text>{new Date().getFullYear() - 1}</Text>
            <Text>{t('report.shared.millionEuro')}</Text>
        </View>
        <View style={styles.narrowerColumns}>
            <Text>{t('TA')}</Text>
            <Text>{new Date().getFullYear() }</Text>
            <Text>{t('report.shared.millionEuro')}</Text>
        </View>
        <View style={styles.narrowerColumns}>
            <Text>{t('TA')}</Text>
            <Text>{new Date().getFullYear() + 1}</Text>
            <Text>{t('report.shared.millionEuro')}</Text>
        </View>
        <View style={styles.narrowerColumns}>
            <Text>{t('TS')}</Text>
            <Text>{new Date().getFullYear() + 2 }</Text>
            <Text>{t('report.shared.millionEuro')}</Text>
        </View>
        <View style={styles.narrowerColumns}>
            <Text>{t('TS')}</Text>
            <Text>{new Date().getFullYear() + 3}</Text>
            <Text>{t('report.shared.millionEuro')}</Text>
        </View>
        <View style={styles.widerColumns}>
            <Text>{t('initial')}</Text>
            <Text>{new Date().getFullYear() + 4}</Text>
            <Text>{t('report.shared.millionEuro')}</Text>
        </View>
        {currentPlusYears.map((year) => {
            return (
                <View key={year} style={styles.widerColumns}>
                    <Text>{t('initial')}</Text>
                    <Text>{new Date().getFullYear() + year}</Text>
                    <Text>{t('report.shared.millionEuro')}</Text>
                </View>
            );
        })}
    </View>
  );
};

export default memo(BudgetBookSummaryTableHeader);
