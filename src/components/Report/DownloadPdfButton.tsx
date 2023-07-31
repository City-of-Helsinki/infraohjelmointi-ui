import { Button, IconDownload } from 'hds-react';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
import { BlobProvider } from '@react-pdf/renderer';
import saveAs from 'file-saver';
import BudgetProposal from './PdfReports/BudgetProposal';
import ConstructionProgram from './PdfReports/ConstructionProgram/ConstructionProgram';
import { Page, Document } from '@react-pdf/renderer';
import './pdfFonts';
import './styles.css';

interface IDownloadPdfButtonProps {
  type: ReportType;
}

/**
 * EmptyDocument is here as a placeholder to not cause an error when rendering rows for documents that
 * still haven't been implemented.
 */
const EmptyDocument = () => (
  <Document title="empty">
    <Page size="A3"></Page>
  </Document>
);

const pdfDocument = {
  budgetProposal: <BudgetProposal />,
  strategy: <EmptyDocument />,
  constructionProgram: <ConstructionProgram />,
  budgetBookSummary: <EmptyDocument />,
  financialStatement: <EmptyDocument />,
};

/**
 * We're using pdf-react to create pdf's.
 *
 * The styles are a bit funky since pdf-react doesn't support grid or table.
 */
const DownloadPdfButton: FC<IDownloadPdfButtonProps> = ({ type }) => {
  const { t } = useTranslation();

  const documentName = useMemo(() => t(`report.${type}.documentName`), [type]);

  const downloadIcon = useMemo(() => <IconDownload />, []);

  const handleDownload = useCallback(
    (blob: Blob | null) => {
      if (blob) {
        saveAs(blob, `${documentName}.pdf`);
      }
    },
    [documentName],
  );

  return (
    <BlobProvider document={pdfDocument[type as keyof typeof pdfDocument]}>
      {({ blob }) => (
        <div className="report-download-pdf-button" data-testid={`download-pdf-${type}`}>
          <Button
            iconLeft={downloadIcon}
            onClick={() => handleDownload(blob)}
            disabled={type !== 'budgetProposal' && type !== 'constructionProgram'}
          >
            {t('downloadPdf', { name: documentName })}
          </Button>
        </div>
      )}
    </BlobProvider>
  );
};

export default DownloadPdfButton;
