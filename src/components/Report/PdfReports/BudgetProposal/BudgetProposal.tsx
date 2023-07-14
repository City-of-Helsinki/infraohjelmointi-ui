import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import BudgetProposalTable from './BudgetProposalTable';
import DocumentHeader from '../DocumentHeader';
import { getToday } from '@/utils/dates';
import { memo } from 'react';

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
    <Document title={t('report.budgetProposal.title') ?? ''}>
      <Page size="A3" style={styles.page}>
        <View style={styles.document}>
          {/* Header */}
          <DocumentHeader
            title={t('report.budgetProposal.title', { startYear: '2023', endYear: '2032' })}
            subtitleOne={t('report.budgetProposal.subtitleOne') as string}
            subtitleTwo={t('report.budgetProposal.subtitleTwo') as string}
            date={getToday()}
          />
          <BudgetProposalTable />
        </View>
      </Page>
    </Document>
  );
};

export default memo(BudgetProposal);
