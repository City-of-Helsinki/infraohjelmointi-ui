import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import BudgetProposalHeader from './BudgetProposalHeader';
import BudgetProposalTable from './BudgetProposalTable';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'HelsinkiGrotesk',
    fontSize: '11px',
  },
  document: {
    margin: '28px',
  },
});

const BudgetProposal = () => {
  const { t } = useTranslation();
  return (
    <Document title={t('report.budgetProposal.documentName') ?? ''}>
      <Page size="A3" style={styles.page}>
        <View style={styles.document}>
          {/* Header */}
          <BudgetProposalHeader />
          <BudgetProposalTable />
        </View>
      </Page>
    </Document>
  );
};

export default memo(BudgetProposal);
