import { Button, IconDownload } from 'hds-react';
import { FC, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
import { pdf } from '@react-pdf/renderer';
import saveAs from 'file-saver';
import { Page, Document } from '@react-pdf/renderer';
import { IClassHierarchy, ICoordinatorClassHierarchy } from '@/reducers/classSlice';
import { getProjectsWithParams } from '@/services/projectServices';
import { IProject } from '@/interfaces/projectInterfaces';
import './pdfFonts';
import './styles.css';
import { ILocation } from '@/interfaces/locationInterfaces';
import ReportContainer from './PdfReports/ReportContainer';
import { useAppDispatch } from '@/hooks/common';
import { setLoading, clearLoading } from '@/reducers/loaderSlice';
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
  divisions: Array<ILocation>,
  classes: IClassHierarchy,
  projects: Array<IProject>,
) => {
  const pdfDocument = {
    budgetProposal: <EmptyDocument />,
    strategy: <EmptyDocument />,
    constructionProgram: (
      <ReportContainer data={{divisions: divisions, classes: classes, projects: projects}} reportType={'constructionProgram'}/>
    ),
    budgetBookSummary: (
      <ReportContainer data={{divisions: divisions, classes: classes, projects:[]}} reportType={'budgetBookSummary'}/>
    ),
    financialStatement: <EmptyDocument />,
  };

  return pdfDocument[type];
};

const downloadIcon = <IconDownload />;

interface IDownloadPdfButtonProps {
  type: ReportType;
  divisions: Array<ILocation>;
  classes: IClassHierarchy;
  forcedToFrameClasses: ICoordinatorClassHierarchy;
}

/**
 * We're using pdf-react to create pdf's.
 *
 * The styles are a bit funky since pdf-react doesn't support grid or table.
 */
const DownloadPdfButton: FC<IDownloadPdfButtonProps> = ({ type, divisions, classes, forcedToFrameClasses }) => {
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
        case 'budgetBookSummary':
          document = getPdfDocument(type, divisions, forcedToFrameClasses, []);
          break;
        default: {
          const res = await getProjectsWithParams({
            direct: false,
            programmed: false,
            params: 'overMillion=true',
            forcedToFrame: false,
            year,
          });
          if (res.results.length > 0) {
            document = getPdfDocument(type, divisions, classes, res.results);
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
  }, [classes, documentName, divisions, type]);

  return (
    <Button
      iconLeft={downloadIcon}
      onClick={() => downloadPdf()}
      disabled={type !== 'constructionProgram' && type !== 'budgetBookSummary'}
    >
      {t('downloadPdf', { name: documentName })}
    </Button>
  );
};

export default memo(DownloadPdfButton);
