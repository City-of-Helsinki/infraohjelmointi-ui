import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { memo } from 'react';
import BudgetProposalTableHeader from './BudgetProposalTableHeader';
import BudgetProposalTableRow from './BudgetProposalTableRow';
import { useTranslation } from 'react-i18next';

const styles = StyleSheet.create({
  table: {
    borderColor: '1px solid #808080',
    borderBottom: '1px solid #808080',
    borderLeft: '1px solid #808080',
    borderRight: '1px solid #808080',
    fontSize: '8px',
  },
  tableTitle: {
    fontWeight: 500,
    marginBottom: '12px',
  },
});

const BudgetProposalTable = () => {
  const { t } = useTranslation();
  return (
    <View>
      <Text style={styles.tableTitle}>
        {t('report.budgetProposal.tableTitle', {
          startYear: 2023,
          financialPlanStartYear: 2024,
          financialPlanEndYear: 2025,
          investmentProgramStartYear: 2026,
          investmentProgramEndYear: 2032,
        })}
      </Text>
      <View style={styles.table}>
        <BudgetProposalTableHeader />
        <BudgetProposalTableRow />
      </View>
    </View>
  );
};

export default memo(BudgetProposalTable);
