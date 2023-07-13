import { Button, IconDownload } from 'hds-react';
import { FC, ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
import BudgetProposal from './Reports/BudgetProposal';
import { BlobProvider } from '@react-pdf/renderer';
import saveAs from 'file-saver';
import './pdfStyles';
import './styles.css';

interface IReportRowProps {
  type: ReportType;
  lastUpdated: string;
}

interface IReportDownloadPdfButtonProps {
  document: ReactElement;
  type: ReportType;
}

const ReportDownloadPdfButton: FC<IReportDownloadPdfButtonProps> = ({ document, type }) => {
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
    <BlobProvider document={document}>
      {({ blob }) => (
        <div className="report-download-pdf-button" data-testid={`download-pdf-${type}`}>
          <Button
            iconLeft={downloadIcon}
            onClick={() => handleDownload(blob)}
            disabled={type !== 'budgetProposal'}
          >
            {t('downloadPdf', { name: documentName })}
          </Button>
        </div>
      )}
    </BlobProvider>
  );
};

const ReportRow: FC<IReportRowProps> = ({ type, lastUpdated }) => {
  const { t } = useTranslation();

  const downloadIcon = useMemo(() => <IconDownload />, []);

  const buildXlsx = useCallback(() => {
    // TODO: handle building xlsx for different types
    switch (type) {
      default:
        break;
    }
  }, [type]);

  return (
    <div className="report-row-container" data-testid={`report-row-${type}`}>
      {/* report title */}
      <h3 className="report-title" data-testid={`report-title-${type}`}>
        {t(`report.${type}.title`)}
      </h3>
      {/* last updated date */}
      <div className="report-last-updated" data-testid={`last-updated-${type}`}>{`${t(
        'lastUpdated',
      )} ${lastUpdated}`}</div>
      {/* download pdf button */}
      <ReportDownloadPdfButton document={<BudgetProposal />} type={type} />
      {/* download xlsx button */}
      <div className="report-download-xlsx-button" data-testid={`download-xlsx-${type}`}>
        <Button iconLeft={downloadIcon} variant="secondary" onClick={buildXlsx} disabled={true}>
          {t('downloadXlsx', { name: t(`report.${type}.documentName`) })}
        </Button>
      </div>
    </div>
  );
};

export default ReportRow;
