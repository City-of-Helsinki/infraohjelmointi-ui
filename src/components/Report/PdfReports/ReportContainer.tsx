import { Page, Document, StyleSheet, View } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import { FC, memo } from 'react';
import {
  IBasicReportData,
  IOperationalEnvironmentAnalysisTableRow,
  ReportType,
  Reports,
} from '@/interfaces/reportInterfaces';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { IProject } from '@/interfaces/projectInterfaces';
import DocumentHeader from './reportHeaders/DocumentHeader';
import ReportTable from './ReportTable';
import StrategyReportFooter from './reportFooters/StrategyReportFooter';
import DefaultReportFooter from './reportFooters/DefaultReportFooter';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';
import OperationalEnvironmentCategorySummary from './OperationalEnvironmentCategorySummary';
import { buildOperationalEnvironmentAnalysisRows } from '../common';
import { convertToReportRows } from '@/utils/reportHelpers';

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
  projectsInWarrantyPhase?: IProject[];
  forcedToFrameRows?: IPlanningRow[];
  sapCosts?: Record<string, IProjectSapCost>;
  currentYearSapValues?: Record<string, IProjectSapCost>;
  year?: number;
}

const ReportContainer: FC<IPdfReportContainerProps> = ({
  reportType,
  data,
  projectsInWarrantyPhase,
  forcedToFrameRows,
  sapCosts,
  currentYearSapValues,
  year = new Date().getFullYear(),
}) => {
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
      case Reports.ConstructionProgramForcedToFrame:
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
  };

  const getDocumentSubtitleOne = () => {
    switch (reportType) {
      case Reports.ForecastReport:
        return t('report.strategy.subtitle', {
          startYear: currentYear,
        });
      case Reports.ConstructionProgramForecast:
        return t('report.constructionProgramForecast.subTitle', {
          year: currentYear,
        });
      case Reports.Strategy:
        return t('report.strategy.subtitle', {
          startYear: year,
        });
      case Reports.StrategyForcedToFrame:
        return t('report.strategy.subtitle', {
          startYear: currentYear + 1,
        });
      case Reports.ConstructionProgram:
      case Reports.ConstructionProgramForcedToFrame:
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
  };

  const getDocumentSubtitleTwo = () => {
    if (
      reportType == Reports.OperationalEnvironmentAnalysis ||
      reportType === Reports.OperationalEnvironmentAnalysisForcedToFrame
    ) {
      return t('report.operationalEnvironmentAnalysis.subtitleTwo');
    }

    if (reportType === Reports.ForecastReport || reportType === Reports.ConstructionProgramForecast)
      return t('report.forecastReport.subtitleTwo', {
        currentDate: currentDate,
      });

    return '';
  };

  const documentTitle = getDocumentTitle();
  const documentSubtitleOne = getDocumentSubtitleOne();
  const documentSubtitleTwo = getDocumentSubtitleTwo();
  const documentOrientation =
    reportType === Reports.ConstructionProgram ||
    reportType === Reports.ConstructionProgramForcedToFrame
      ? 'portrait'
      : 'landscape';

  const operationalEnvironmentAnalysisReport =
    reportType === Reports.OperationalEnvironmentAnalysis ||
    reportType === Reports.OperationalEnvironmentAnalysisForcedToFrame;

  const reportRows = convertToReportRows(
    data.rows,
    reportType,
    data.categories,
    t,
    data.divisions,
    data.subDivisions,
    projectsInWarrantyPhase,
    forcedToFrameRows,
    sapCosts,
    currentYearSapValues,
    year,
  );

  const documentHeader = (
    <DocumentHeader
      title={documentTitle}
      subtitleOne={documentSubtitleOne}
      subtitleTwo={documentSubtitleTwo}
      reportType={reportType}
      date={operationalEnvironmentAnalysisReport ? currentDate : ''}
    />
  );

  return (
    <Document title={documentTitle}>
      {operationalEnvironmentAnalysisReport && (
        // For Operational Environment Analysis report, first page is category summary
        <Page size="A2" style={styles.page}>
          <View style={styles.document}>
            {documentHeader}
            <OperationalEnvironmentCategorySummary
              rows={buildOperationalEnvironmentAnalysisRows(
                reportRows as IOperationalEnvironmentAnalysisTableRow[],
              )}
            />
            <DefaultReportFooter />
          </View>
        </Page>
      )}
      <Page
        orientation={documentOrientation}
        size={reportType !== Reports.ForecastReport ? 'A3' : 'A2'}
        style={styles.page}
      >
        <View style={styles.document}>
          {documentHeader}
          <ReportTable reportType={reportType} reportRows={reportRows} year={year} />
          {[Reports.Strategy, Reports.StrategyForcedToFrame, Reports.ForecastReport].includes(
            reportType as Reports,
          ) ? (
            <StrategyReportFooter
              colorInfoTextOne={t('report.strategy.planning')}
              colorInfoTextTwo={t('report.strategy.constructing')}
              colorInfoTextThree={t('report.strategy.warrantyPeriod')}
            />
          ) : (
            <DefaultReportFooter />
          )}
        </View>
      </Page>
    </Document>
  );
};

export default memo(ReportContainer);
