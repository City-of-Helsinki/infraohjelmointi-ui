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
  projectCell: {
    ...cellStyles,
    paddingLeft: '21px',
    width: '450px',
  },
  projectManagerCell: {
    ...cellStyles,
    width: '200px',
    paddingRight: '15px',
    paddingLeft: '21px'
  },
  projectPhaseCell: {
    ...cellStyles,
    width: '100px',
  },
  budgetCell: {
    ...cellStyles,
    paddingRight: '3px',
    width: '80px',
  },
  monthCell: {
    ...cellStyles,
    width: '30px'
  },
  lastCell: {
    ...cellStyles,
    width: '30px',
  },
  budgetOverrunReasonCell: {
    ...cellStyles,
    paddingRight: '21px',
    paddingLeft: '6px',
    width: '280px',
  },
});

interface StrategyTableHeaderProps {
  isForecastReport: boolean;
  year?: number;
}

const StrategyAndForecastTableHeader = ({ isForecastReport, year = new Date().getFullYear() }: StrategyTableHeaderProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tableHeader}>
      <View style={styles.tableHeaderRow}>
        <Text style={styles.projectCell}>{`\n${t('report.strategy.projectNameTitle')}`}</Text>
        <Text style={styles.projectManagerCell}>{`${t('report.strategy.projectsTitle')}\n${t('report.strategy.projectManagerTitle')}`}</Text>
        <Text style={styles.projectPhaseCell}>{`\n${t('projectPhase')}`}</Text>
        <Text style={styles.budgetCell}>{`${t('report.shared.ta')} ${year}\n${t('report.shared.kiloEuro')}`}</Text>
        <Text style={styles.budgetCell}>{`${t('report.shared.ts')} ${year}\n${t('report.shared.kiloEuro')}`}</Text>
        {
          isForecastReport ?
            <>
              <Text style={styles.budgetCell}>{`${t('report.forecastReport.forecastValue')} ${year}\n${t('report.shared.kiloEuro')}`}</Text>
              <Text style={styles.budgetCell}>{`${t('report.forecastReport.differenceValue')}\n${t('report.shared.kiloEuro')}`}</Text>
            </> : null
        }
        {
          isForecastReport && <Text style={styles.budgetOverrunReasonCell}>{`\n${t('report.constructionProgramForecast.differenceReasonTitle')}`}</Text>
        }
        <Text style={styles.monthCell}>{`${year}\n01`}</Text>
        <Text style={styles.monthCell}>{`\n02`}</Text>
        <Text style={styles.monthCell}>{`\n03`}</Text>
        <Text style={styles.monthCell}>{`\n04`}</Text>
        <Text style={styles.monthCell}>{`\n05`}</Text>
        <Text style={styles.monthCell}>{`\n06`}</Text>
        <Text style={styles.monthCell}>{`\n07`}</Text>
        <Text style={styles.monthCell}>{`\n08`}</Text>
        <Text style={styles.monthCell}>{`\n09`}</Text>
        <Text style={styles.monthCell}>{`\n10`}</Text>
        <Text style={styles.monthCell}>{`\n11`}</Text>
        <Text style={styles.monthCell}>{`\n12`}</Text>
        <Text style={styles.lastCell}/>
      </View>
    </View>
  );
};

export default memo(StrategyAndForecastTableHeader);