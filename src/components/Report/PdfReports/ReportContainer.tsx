import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import { FC, memo } from 'react';
import { IBasicReportData, ReportType, Reports } from '@/interfaces/reportInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import DocumentHeader from './reportHeaders/DocumentHeader';
import ReportTable from './ReportTable';
import StrategyReportFooter from './reportFooters/StrategyReportFooter';
import DefaultReportFooter from './reportFooters/DefaultReportFooter';

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
  projectsInWarrantyPhase?: IProject[],
}

const ReportContainer: FC<IPdfReportContainerProps> = ({ reportType, data, projectsInWarrantyPhase }) => {
  const { t } = useTranslation();

  const date = new Date();
  const currentYear = date.getFullYear();
  const currentDate = `${date.getDate()}.${date.getMonth() + 1}.${currentYear}`;

  const getDocumentTitle = () => {
    switch (reportType) {
      case Reports.Strategy:
      case Reports.StrategyForcedToFrame:
        return t('report.strategy.title');
      case Reports.ConstructionProgram:
        return t('report.constructionProgram.title');
      case Reports.BudgetBookSummary:
        return t('report.budgetBookSummary.title');
      case Reports.OperationalEnvironmentAnalysis:
      case Reports.OperationalEnvironmentAnalysisForcedToFrame:
        return t('report.operationalEnvironmentAnalysis.title', {
          startYear: currentYear + 1,
          endYear: currentYear + 10,
        });
      default:
        return '';
    }
  }

  const getDocumentSubtitleOne = () => {
    switch (reportType) {
      case Reports.Strategy:
      case Reports.StrategyForcedToFrame:
        return t('report.strategy.subtitle', {
          startYear: new Date().getFullYear() + 1
        });
      case Reports.ConstructionProgram:
        return t('report.constructionProgram.subtitle', {
            startYear: new Date().getFullYear() + 1,
            endYear: new Date().getFullYear() + 3,
          });
      case Reports.BudgetBookSummary:
        return t('report.budgetBookSummary.subtitle', {
          startYear: new Date().getFullYear() + 1,
          endYear: new Date().getFullYear() + 10,
        });
      case Reports.OperationalEnvironmentAnalysis:
      case Reports.OperationalEnvironmentAnalysisForcedToFrame:
        return t('report.operationalEnvironmentAnalysis.subtitleOne');
      default:
        return '';
    }
  }
  const getDocumentSubtitleTwo = () => {
    if (reportType == Reports.OperationalEnvironmentAnalysis || reportType === Reports.OperationalEnvironmentAnalysisForcedToFrame) {
      return t('report.operationalEnvironmentAnalysis.subtitleTwo');
    }

    return '';
  }

  const documentTitle = getDocumentTitle();
  const documentSubtitleOne = getDocumentSubtitleOne();
  const documentSubtitleTwo = getDocumentSubtitleTwo();
  return (
    <Document title={documentTitle}>
      <Page orientation={reportType !== Reports.ConstructionProgram ? "landscape" : "portrait" } size="A3" style={styles.page}>
        <View style={styles.document}>
          <DocumentHeader
            title={documentTitle}
            subtitleOne={documentSubtitleOne}
            subtitleTwo={documentSubtitleTwo}
            reportType={reportType}
            date={(reportType === Reports.OperationalEnvironmentAnalysis || reportType === Reports.OperationalEnvironmentAnalysisForcedToFrame) ? currentDate : ''}
          />
          <ReportTable reportType={reportType} data={data} projectsInWarrantyPhase={projectsInWarrantyPhase} />
          {reportType === Reports.Strategy || reportType === Reports.StrategyForcedToFrame ?
            <StrategyReportFooter
              infoText={t('report.strategy.footerInfoText')}
              colorInfoTextOne={t('report.strategy.planning')}
              colorInfoTextTwo={t('report.strategy.constructing')}
            /> : <DefaultReportFooter/>
          }
        </View>
      </Page>
    </Document>
  );
};

export default memo(ReportContainer);
