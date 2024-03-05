import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import DocumentHeader from './DocumentHeader';
import ReportTable from './ReportTable';
import { FC, memo } from 'react';
import { IBasicReportData, ReportType } from '@/interfaces/reportInterfaces';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'HelsinkiGrotesk',
    fontSize: '11px',
  },
  document: {
    margin: '28px',
  },
});

interface IPdfReportContainerProps {
  reportType: ReportType;
  data: IBasicReportData;
}

const ReportContainer: FC<IPdfReportContainerProps> = ({ reportType, data }) => {
  const { t } = useTranslation();

  const getDocumentTitle = () => {
    switch (reportType) {
      case 'strategy':
        return t('report.strategy.title', {startYear: new Date().getFullYear()});
      case 'constructionProgram':
        return t('report.constructionProgram.title');
      case 'budgetBookSummary':
        return t('report.budgetBookSummary.title', {
          startYear: new Date().getFullYear() + 1,
          endYear: new Date().getFullYear() + 10,
        });
      default:
        return '';
    }
  }

  const getDocumentSubtitle = () => {
    switch (reportType) {
      case 'strategy':
        return t('report.strategy.subtitle')
      case 'constructionProgram':
        return t('report.constructionProgram.subtitle', {
            startYear: new Date().getFullYear() + 1,
            endYear: new Date().getFullYear() + 3,
          });
      case 'budgetBookSummary':
        return t('report.budgetBookSummary.subtitle');
      default:
        return '';
    }
  }

  const documentTitle = getDocumentTitle();
  const documentSubtitle = getDocumentSubtitle();

  return (
    <Document title={documentTitle}>
      <Page orientation={reportType !== 'constructionProgram' ? "landscape" : "portrait" } size="A3" style={styles.page}>
        <View style={styles.document}>
          <DocumentHeader
            title={documentTitle}
            subtitleOne={documentSubtitle}
          />
          <ReportTable reportType={reportType} data={data} />
        </View>
      </Page>
    </Document>
  );
};

export default memo(ReportContainer);
