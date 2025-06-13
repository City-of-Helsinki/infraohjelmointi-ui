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
    width: '28.5%',
    paddingLeft: '8px',
  },
  narrowerColumns: {
    alignItems: 'center' as unknown as 'center',
    width: '6.5%',
  },
  yearContainer: {
    width: '45.5%',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center' as unknown as 'center',
  },
  wideYearColumn: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end' as unknown as 'flex-end',
    justifyContent: 'center' as unknown as 'center',
  },
  yearColumn: {
    width: '14.28%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center' as unknown as 'center',
    padding: '0px 10px',
  }
});

const OperationalEnvironmentAnalysisTableHeader = () => {
  const { t } = useTranslation();
  const currentPlusYears = [4, 5, 6, 7, 8, 9, 10];
  return (
    <View style={styles.tableHeader}>
        <Text style={styles.targetCell}>{t('target')}</Text>
        <View style={styles.narrowerColumns}>
            <Text>{t('report.operationalEnvironmentAnalysis.costForecastShortened')}</Text>
            <Text>{new Date().getFullYear()}</Text>
            <Text>{t('report.shared.kiloEuro')}</Text>
        </View>
        <View style={styles.narrowerColumns}>
            <Text>{t('TAE')}</Text>
            <Text>{new Date().getFullYear() + 1}</Text>
            <Text>{t('report.shared.kiloEuro')}</Text>
        </View>
        <View style={styles.narrowerColumns}>
            <Text>{t('TSE')}</Text>
            <Text>{new Date().getFullYear() + 2}</Text>
            <Text>{t('report.shared.kiloEuro')}</Text>
        </View>
        <View style={styles.narrowerColumns}>
            <Text>{t('TSE')}</Text>
            <Text>{new Date().getFullYear() + 3}</Text>
            <Text>{t('report.shared.kiloEuro')}</Text>
        </View>
        <View style={styles.yearContainer}>
          <Text>
            {t('initialInvestmentProgram', {
              startYear: new Date().getFullYear() + 4,
              endYear: new Date().getFullYear() + 9,
            })}
          </Text>
          <View style={styles.wideYearColumn}>
            {currentPlusYears.map((year) => {
                return (
                  <View key={year} style={styles.yearColumn}>
                    <Text>{new Date().getFullYear() + year}</Text>
                    <Text>{t('report.shared.kiloEuro')}</Text>
                  </View>
                );
            })}
          </View>
        </View>
    </View>
  );
};

export default memo(OperationalEnvironmentAnalysisTableHeader);
