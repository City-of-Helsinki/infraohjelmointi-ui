import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import DocumentHeader from './DocumentHeader';
import ReportTable from './ReportTable';
import { FC, memo } from 'react';
import StrategyReportFooter from './StrategyReportFooter';
import { IBasicReportData, ReportType, Reports } from '@/interfaces/reportInterfaces';

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
      case Reports.Strategy:
        return t('report.strategy.title', {startYear: new Date().getFullYear()});
      case Reports.ConstructionProgram:
        return t('report.constructionProgram.title');
      case Reports.BudgetBookSummary:
        return t('report.budgetBookSummary.title', {
          startYear: new Date().getFullYear() + 1,
          endYear: new Date().getFullYear() + 10,
        });
      case Reports.OperationalEnvironmentAnalysis:
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
      case Reports.Strategy:
        return t('report.strategy.subtitle')
      case Reports.ConstructionProgram:
        return t('report.constructionProgram.subtitle', {
            startYear: new Date().getFullYear() + 1,
            endYear: new Date().getFullYear() + 3,
          });
      case Reports.BudgetBookSummary:
        return t('report.budgetBookSummary.subtitle');
      case Reports.OperationalEnvironmentAnalysis:
        return t('report.operationalEnvironmentAnalysis.subtitleOne');
      default:
        return '';
    }
  }
  const getDocumentSubtitleTwo = () => {
    if (reportType == Reports.OperationalEnvironmentAnalysis) {
      return t('report.operationalEnvironmentAnalysis.subtitleTwo');
    } else {
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
      <Page orientation={reportType !== Reports.ConstructionProgram ? "landscape" : "portrait" } size="A3" style={styles.page}>
        <View style={styles.document}>
          <DocumentHeader
            title={documentTitle}
            subtitleOne={documentSubtitleOne}
            subtitleTwo={documentSubtitleTwo}
            reportType={reportType}
            date={reportType === Reports.OperationalEnvironmentAnalysis ? currentDate : ''}
          />
          <ReportTable reportType={reportType} data={data} />
          {reportType === Reports.Strategy &&
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
