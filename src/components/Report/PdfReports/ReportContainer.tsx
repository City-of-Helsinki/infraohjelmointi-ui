import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import DocumentHeader from './DocumentHeader';
import ReportTable from './ReportTable';
import { FC, memo } from 'react';
import { IBasicReportData, ReportType } from '@/interfaces/reportInterfaces';
import StrategyReportFooter from './StrategyReportFooter';

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
      case 'operationalEnvironmentAnalysis':
        return t('report.operationalEnvironmentAnalysis.title', {
          startYear: new Date().getFullYear() + 1,
          endYear: new Date().getFullYear() + 10,
        });
      default:
        return '';
    }
  }

  const getDocumentSubtitleOne = () => {
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
      case 'operationalEnvironmentAnalysis':
        return t('report.operationalEnvironmentAnalysis.subtitleOne');
      default:
        return '';
    }
  }
  const getDocumentSubtitleTwo = () => {
    switch (reportType) {
      case 'operationalEnvironmentAnalysis':
        return t('report.operationalEnvironmentAnalysis.subtitleTwo');
      default:
        return '';
    }
  }

  const documentTitle = getDocumentTitle();
  const documentSubtitleOne = getDocumentSubtitleOne();
  const documentSubtitleTwo = getDocumentSubtitleTwo();
  const date = new Date();
  const currentDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  return (
    <Document title={documentTitle}>
      <Page orientation={reportType !== 'constructionProgram' ? "landscape" : "portrait" } size="A3" style={styles.page}>
        <View style={styles.document}>
          <DocumentHeader
            title={documentTitle}
            subtitleOne={documentSubtitleOne}
            subtitleTwo={documentSubtitleTwo}
            reportType={reportType}
            date={reportType === 'operationalEnvironmentAnalysis' ? currentDate : ''}
          />
          <ReportTable reportType={reportType} data={data} />
          {reportType === 'strategy' &&
            <StrategyReportFooter
              infoText={t('report.strategy.footerInfoText')}
              colorInfoTextOne={t('report.strategy.planning')}
              colorInfoTextTwo={t('report.strategy.constructing')}/>
          }
        </View>
      </Page>
    </Document>
  );
};

export default memo(ReportContainer);
