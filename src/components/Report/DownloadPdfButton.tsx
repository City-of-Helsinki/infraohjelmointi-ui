import { Button, IconDownload } from 'hds-react';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
import { pdf } from '@react-pdf/renderer';
import saveAs from 'file-saver';
import ConstructionProgram from './PdfReports/ConstructionProgram/ConstructionProgram';
import { Page, Document } from '@react-pdf/renderer';
import { IClassHierarchy } from '@/reducers/classSlice';
import { getProjectsWithParams } from '@/services/projectServices';
import { IProject } from '@/interfaces/projectInterfaces';
import './pdfFonts';
import './styles.css';
import { ILocation } from '@/interfaces/locationInterfaces';

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
      <ConstructionProgram divisions={divisions} classes={classes} projects={projects} />
    ),
    budgetBookSummary: <EmptyDocument />,
    financialStatement: <EmptyDocument />,
  };

  return pdfDocument[type];
};

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

  const downloadIcon = useMemo(() => <IconDownload />, []);

  const downloadPdf = useCallback(async () => {
    try {
      const res = await getProjectsWithParams({
        direct: false,
        programmed: false,
        params: 'overMillion=true',
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

export default DownloadPdfButton;
