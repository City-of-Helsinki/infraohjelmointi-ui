import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import { FC, memo } from 'react';
import { IBasicReportData, ReportType, Reports } from '@/interfaces/reportInterfaces';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import DocumentHeader from './reportHeaders/DocumentHeader';
import ReportTable from './ReportTable';
import StrategyReportFooter from './reportFooters/StrategyReportFooter';
import DefaultReportFooter from './reportFooters/DefaultReportFooter';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';

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
  forcedToFrameRows?: IPlanningRow[],
  sapCosts?: Record<string, IProjectSapCost>,
  currentYearSapValues?: Record<string, IProjectSapCost>,
}

const ReportContainer: FC<IPdfReportContainerProps> = ({ reportType, data, projectsInWarrantyPhase, forcedToFrameRows, sapCosts, currentYearSapValues }) => {
  const { t } = useTranslation();

  const date = new Date();
  const currentYear = date.getFullYear();
  const currentDate = `${date.getDate()}.${date.getMonth() + 1}.${currentYear}`;

  const getDocumentTitle = () => {
    switch (reportType) {
      case Reports.ForecastReport:
      case Reports.Strategy:
      case Reports.StrategyForcedToFrame:
        return t('report.strategy.title');
      case Reports.ConstructionProgram:
      case Reports.ConstructionProgramForecast:
        return t('report.constructionProgram.title');
      case Reports.BudgetBookSummary:
        return t('report.budgetBookSummary.title');
      case Reports.OperationalEnvironmentAnalysis:
        return t('report.operationalEnvironmentAnalysis.title', {
          startYear: currentYear + 1,
          endYear: currentYear + 10,
        });
      case Reports.OperationalEnvironmentAnalysisForcedToFrame:
        return t('report.operationalEnvironmentAnalysisForcedToFrame.title', {
          startYear: currentYear + 1,
          endYear: currentYear + 10,
        });
      default:
        return '';
    }
  }

  const getDocumentSubtitleOne = () => {
    switch (reportType) {
      case Reports.ForecastReport:
        return t('report.strategy.subtitle', {
          startYear: currentYear
        });
      case Reports.ConstructionProgramForecast:
        return t('report.constructionProgramForecast.subTitle', {
          year: currentYear
        });
      case Reports.Strategy:
      case Reports.StrategyForcedToFrame:
        return t('report.strategy.subtitle', {
          startYear: currentYear + 1
        });
      case Reports.ConstructionProgram:
        return t('report.constructionProgram.subtitle', {
            startYear: currentYear + 1,
            endYear: currentYear + 3,
          });
      case Reports.BudgetBookSummary:
        return t('report.budgetBookSummary.subtitle', {
          startYear: currentYear + 1,
          endYear: currentYear + 10,
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

    if (reportType === Reports.ForecastReport || reportType === Reports.ConstructionProgramForecast)
      return t('report.forecastReport.subtitleTwo', {
        currentDate: currentDate,
      });

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
          <ReportTable 
            reportType={reportType}
            data={data}
            projectsInWarrantyPhase={projectsInWarrantyPhase}
            hierarchyInForcedToFrame={forcedToFrameRows}
            sapCosts={sapCosts}
            currentYearSapValues={currentYearSapValues}
          />
          {reportType === Reports.Strategy || reportType === Reports.StrategyForcedToFrame || reportType == Reports.ForecastReport ?
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
