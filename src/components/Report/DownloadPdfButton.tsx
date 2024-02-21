import { Button, IconDownload } from 'hds-react';
import { FC, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
import { pdf } from '@react-pdf/renderer';
import saveAs from 'file-saver';
import { Page, Document } from '@react-pdf/renderer';
import { IClassHierarchy } from '@/reducers/classSlice';
import { getProjectsWithParams } from '@/services/projectServices';
import { IProject } from '@/interfaces/projectInterfaces';
import './pdfFonts';
import './styles.css';
import { ILocation } from '@/interfaces/locationInterfaces';
import ReportContainer from './PdfReports/ReportContainer';
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
      <ReportContainer data={{divisions: divisions, classes: classes, projects:projects}} reportType={'constructionProgram'}/>
    ),
    budgetBookSummary: <EmptyDocument />,
    financialStatement: <EmptyDocument />,
  };

  return pdfDocument[type];
};

const downloadIcon = <IconDownload />;

interface IDownloadPdfButtonProps {
  type: ReportType;
  divisions: Array<ILocation>;
  classes: IClassHierarchy;
}

/**
 * We're using pdf-react to create pdf's.
 *
 * The styles are a bit funky since pdf-react doesn't support grid or table.
 */
const DownloadPdfButton: FC<IDownloadPdfButtonProps> = ({ type, divisions, classes }) => {
  const { t } = useTranslation();
  const documentName = useMemo(() => t(`report.${type}.documentName`), [type]);

  const downloadPdf = useCallback(async () => {
    try {
      const year = new Date().getFullYear();

      const res = await getProjectsWithParams({
        direct: false,
        programmed: false,
        params: 'overMillion=true',
        forcedToFrame: false,
        year,
      });

      if (res.results.length > 0) {
        const document = getPdfDocument(type, divisions, classes, res.results);
        const documentBlob = await pdf(document).toBlob();

        saveAs(documentBlob, `${documentName}.pdf`);
      }
    } catch (e) {
      console.log(`Error getting projects for ${documentName}: `, e);
    }
  }, [classes, documentName, divisions, type]);

  return (
    <Button
      iconLeft={downloadIcon}
      onClick={() => downloadPdf()}
      disabled={type !== 'constructionProgram'}
    >
      {t('downloadPdf', { name: documentName })}
    </Button>
  );
};

export default memo(DownloadPdfButton);
