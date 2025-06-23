import { Button, IconDownload } from 'hds-react';
import { FC, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { IDownloadPdfButtonProps, ReportType, Reports } from '@/interfaces/reportInterfaces';
import { pdf } from '@react-pdf/renderer';
import saveAs from 'file-saver';
import { Page, Document } from '@react-pdf/renderer';
import './pdfFonts';
import './styles.css';
import ReportContainer from './PdfReports/ReportContainer';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { setLoading, clearLoading } from '@/reducers/loaderSlice';
import { getCoordinationTableRows } from '@/hooks/useCoordinationRows';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { IListItem } from '@/interfaces/common';
import { getDistricts } from '@/services/listServices';
import { getProjectDistricts } from '@/reducers/listsSlice';
import { IProject } from '@/interfaces/projectInterfaces';
import { getCoordinatorAndForcedToFrameRows, getForcedToFrameDataForReports, viewHasProjects } from './common';
import { getProjectSapCosts, getProjectSapCurrentYear } from '@/reducers/sapCostSlice';
import { IProjectSapCost } from '@/interfaces/sapCostsInterfaces';

/**
 * EmptyDocument is here as a placeholder to not cause an error when rendering rows for documents that
 * still haven't been implemented.
 */
const EmptyDocument = () => (
  <Document title="empty">
    <Page size="A3"></Page>
  </Document>
);

const getPdfDocument = (
  type: ReportType,
  rows: IPlanningRow[],
  divisions?: Array<IListItem>,
  subDivisions?: Array<IListItem>,
  categories?: IListItem[],
  projectsInWarrantyPhase?: IProject[],
  forcedToFrameRows?: IPlanningRow[],
  sapCosts?: Record<string, IProjectSapCost>,
  currentYearSapValues?: Record<string, IProjectSapCost>,
) => {
  const pdfDocument = {
    operationalEnvironmentAnalysis: (
      <ReportContainer
        data={{ categories, rows }}
        reportType={Reports.OperationalEnvironmentAnalysis}
        projectsInWarrantyPhase={projectsInWarrantyPhase}
      />
    ),
    operationalEnvironmentAnalysisForcedToFrame: (
      <ReportContainer
        data={{ categories, rows }}
        reportType={Reports.OperationalEnvironmentAnalysisForcedToFrame}
        projectsInWarrantyPhase={projectsInWarrantyPhase}
    />
    ),
    strategy: <ReportContainer data={{ rows }} reportType={Reports.Strategy} />,
    strategyForcedToFrame: (
      <ReportContainer data={{ rows }} reportType={Reports.StrategyForcedToFrame} />
    ),
    forecastReport: <ReportContainer data={{ rows }} reportType={Reports.ForecastReport} forcedToFrameRows={forcedToFrameRows}/>,
    constructionProgramForecast: (
      <ReportContainer 
        data={{ rows, divisions, subDivisions }}
        reportType={Reports.ConstructionProgramForecast}
        forcedToFrameRows={forcedToFrameRows}
        sapCosts={sapCosts}
        currentYearSapValues={currentYearSapValues}
      />
    ),
    constructionProgram: (
      <ReportContainer
        data={{ rows, divisions, subDivisions }}
        sapCosts={sapCosts}
        currentYearSapValues={currentYearSapValues}
        reportType={Reports.ConstructionProgram}
      />
    ),
    budgetBookSummary: <ReportContainer data={{ rows }} reportType={Reports.BudgetBookSummary} />,
    financialStatement: <EmptyDocument />,
  };

  return pdfDocument[type];
};

const downloadIcon = <IconDownload />;

/**
 * We're using pdf-react to create pdf's.
 *
 * The styles are a bit funky since pdf-react doesn't support grid or table.
 */
const DownloadPdfButton: FC<IDownloadPdfButtonProps> = ({
  type,
  getForcedToFrameData,
  getPlanningData,
  getPlanningRows,
  getCategories,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const projectSapCosts = useAppSelector(getProjectSapCosts);
  const projectCurrentYearSapValues = useAppSelector(getProjectSapCurrentYear);
  const documentName = useMemo(() => t(`report.${type}.documentName`), [t, type]);
  const LOADING_PDF_DATA = 'loading-pdf-data';

  const downloadPdf = useCallback(async () => {
    try {
      const year = new Date().getFullYear();
      dispatch(setLoading({ text: 'Loading pdf data', id: LOADING_PDF_DATA }));

      let document: JSX.Element | undefined = undefined;
      switch (type) {
        case Reports.Strategy:
        case Reports.StrategyForcedToFrame:
        case Reports.BudgetBookSummary: {
          // For Strategy report, we will fetch next year data
          const res = await getForcedToFrameDataForReports(getForcedToFrameData, type, year);

          if (viewHasProjects(res)) {
            const coordinatorRows = getCoordinationTableRows(
              res.classHierarchy,
              res.forcedToFrameDistricts.districts,
              res.initialSelections,
              res.projects,
              res.groupRes,
            );
            document = getPdfDocument(type, coordinatorRows);
          }
          break;
        }
        case Reports.ForecastReport: {
          // For ForecastReport report, we will fetch both coordinator and forceToFrame data
          // true = coordinatorData, false = forcedToFrameData
          const resCoordinator = await getForcedToFrameDataForReports(getForcedToFrameData, type, year, true);
          const resForcedToFrame = await getForcedToFrameDataForReports(getForcedToFrameData, type, year, false);

          if (viewHasProjects(resCoordinator)) {
            const rows = await getCoordinatorAndForcedToFrameRows(resCoordinator, resForcedToFrame);
            document = getPdfDocument(type, rows.coordinatorRows, undefined, undefined, undefined, undefined, rows.forcedToFrameRows);
          }
          break;
        }
        case Reports.ConstructionProgramForecast: {
          // For ForecastReport report, we will fetch both coordinator and forceToFrame data
          // true = coordinatorData, false = forcedToFrameData
          const resCoordinator = await getForcedToFrameDataForReports(getForcedToFrameData, type, year, true);
          const resForcedToFrame = await getForcedToFrameDataForReports(getForcedToFrameData, type, year, false);
          const resDivisions = await getDistricts();
          const divisions = getProjectDistricts(resDivisions, 'division');
          const subDivisions = getProjectDistricts(resDivisions, 'subDivision');

          if (viewHasProjects(resCoordinator)) {
            const rows = await getCoordinatorAndForcedToFrameRows(resCoordinator, resForcedToFrame);
            document = getPdfDocument(type, rows.coordinatorRows, divisions, subDivisions, undefined, undefined, rows.forcedToFrameRows, projectSapCosts, projectCurrentYearSapValues);
          }
          break;
        }
        case Reports.OperationalEnvironmentAnalysis:
        case Reports.OperationalEnvironmentAnalysisForcedToFrame: {
          const res = await getForcedToFrameDataForReports(getForcedToFrameData, type, year);
          const categories = await getCategories();

          if (viewHasProjects(res) && categories) {
            const coordinatorRows = getCoordinationTableRows(
              res.classHierarchy,
              res.forcedToFrameDistricts.districts,
              res.initialSelections,
              res.projects,
              res.groupRes,
            );
            document = getPdfDocument(
              type,
              coordinatorRows,
              undefined,
              undefined,
              categories,
              res.projectsInWarrantyPhase,
            );
          }
          break;
        }
        case Reports.ConstructionProgram: {
          const res = await getPlanningData(year + 1);
          const resDivisions = await getDistricts();
          const divisions = getProjectDistricts(resDivisions, 'division');
          const subDivisions = getProjectDistricts(resDivisions, 'subDivision');

          if (viewHasProjects(res)) {
            const planningRows = getPlanningRows(res);
            document = getPdfDocument(type, planningRows, divisions, subDivisions, undefined, undefined, undefined, projectSapCosts, projectCurrentYearSapValues);
          }
        }
      }

      if (document !== undefined) {
        const documentBlob = await pdf(document).toBlob();
        saveAs(documentBlob, `${documentName}.pdf`);
      }
    } catch (e) {
      console.log(`Error getting projects for ${documentName}: `, e);
    } finally {
      dispatch(clearLoading(LOADING_PDF_DATA));

      // Workaround: Reload the page after downloading Strategy report
      // If the Strategy report with ForcedToFrame data is downloaded after coord. data
      // without refreshing the page, the report is fetched from cache and will show incorrect data.
      if ([Reports.Strategy, Reports.StrategyForcedToFrame, Reports.ForecastReport, Reports.OperationalEnvironmentAnalysis, Reports.OperationalEnvironmentAnalysisForcedToFrame].includes(type as Reports)) navigate(0);
    }
  }, [documentName, type]);

  return (
    <Button
      iconStart={downloadIcon}
      onClick={() => downloadPdf()}
      disabled={type === Reports.FinancialStatement}
    >
      {t('downloadPdf', { name: documentName })}
    </Button>
  );
};

export default memo(DownloadPdfButton);
