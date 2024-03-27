import { Button, IconDownload } from 'hds-react';
import { FC, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType, Reports, getForcedToFrameDataType, getPlanningDataType } from '@/interfaces/reportInterfaces';
import { pdf } from '@react-pdf/renderer';
import saveAs from 'file-saver';
import { Page, Document } from '@react-pdf/renderer';
import './pdfFonts';
import './styles.css';
import ReportContainer from './PdfReports/ReportContainer';
import { useAppDispatch } from '@/hooks/common';
import { setLoading, clearLoading } from '@/reducers/loaderSlice';
import { getCoordinationTableRows } from '@/hooks/useCoordinationRows';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { IListItem } from '@/interfaces/common';
import { buildPlanningTableRows } from '@/hooks/usePlanningRows';
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
  categories: IListItem[],
  rows: IPlanningRow[],
) => {
  const pdfDocument = {
    operationalEnvironmentAnalysis:
      <ReportContainer data={{categories, rows}} reportType={Reports.OperationalEnvironmentAnalysis}/>,
    strategy: (
      <ReportContainer data={{categories, rows}} reportType={Reports.Strategy}/>
    ),
    constructionProgram: (
      <ReportContainer data={{categories, rows}} reportType={Reports.ConstructionProgram}/>
    ),
    budgetBookSummary: (
      <ReportContainer data={{categories, rows}} reportType={Reports.BudgetBookSummary}/>
    ),
    financialStatement: <EmptyDocument />,
  };

  return pdfDocument[type];
};

const downloadIcon = <IconDownload />;

interface IDownloadPdfButtonProps {
  type: ReportType;
  categories: IListItem[];
  getForcedToFrameData: (year: number) => getForcedToFrameDataType;
  getPlanningData: (year: number) => getPlanningDataType;
}

/**
 * We're using pdf-react to create pdf's.
 *
 * The styles are a bit funky since pdf-react doesn't support grid or table.
 */
const DownloadPdfButton: FC<IDownloadPdfButtonProps> = ({ type, getForcedToFrameData, getPlanningData, categories }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const documentName = useMemo(() => t(`report.${type}.documentName`), [type]);
  const LOADING_PDF_DATA = 'loading-pdf-data';

  const downloadPdf = useCallback(async () => {
    try {
      const year = new Date().getFullYear();
      dispatch(setLoading({ text: 'Loading pdf data', id: LOADING_PDF_DATA }));

      let document: JSX.Element | undefined = undefined;
      switch(type) {
        case Reports.Strategy:
        case Reports.BudgetBookSummary: 
        case Reports.OperationalEnvironmentAnalysis: {
          const res = await getForcedToFrameData(year);
          if (res && res.projects.length > 0) {
            const coordinatorRows = getCoordinationTableRows(res.classHierarchy, res.forcedToFrameDistricts.districts, res.initialSelections, res.projects, res.groupRes);
            document = getPdfDocument(type, categories, coordinatorRows);
          }
          break;
        }
        case Reports.ConstructionProgram: {
          const res = await getPlanningData(year);
          if (res && res.projects.length > 0) {
            const planningRows = buildPlanningTableRows({
              masterClasses: res.classHierarchy.masterClasses,
              classes: res.classHierarchy.classes,
              subClasses: res.classHierarchy.subClasses,
              collectiveSubLevels: [],
              districts: res.planningDistricts.districts,
              otherClassifications: res.classHierarchy.otherClassifications,
              otherClassificationSubLevels: [],
              divisions: res.planningDistricts.divisions ?? [],
              groups: res.groupRes
            }, res.projects, res.initialSelections, res.planningDistricts.subDivisions);
            document = getPdfDocument(type, categories, planningRows);
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
    }
  }, [documentName, type]);

  return (
    <Button
      iconLeft={downloadIcon}
      onClick={() => downloadPdf()}
      disabled={type === Reports.FinancialStatement}
    >
      {t('downloadPdf', { name: documentName })}
    </Button>
  );
};

export default memo(DownloadPdfButton);
