import { Button, IconDownload } from 'hds-react';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
import './styles.css';

interface IReportRowProps {
  type: ReportType;
  lastUpdated: string;
}

const ReportRow: FC<IReportRowProps> = ({ type, lastUpdated }) => {
  const { t } = useTranslation();

  const downloadIcon = useMemo(() => <IconDownload />, []);

  const buildPdf = useCallback(() => {
    // TODO: handle building pdf for different types
    switch (type) {
      default:
        break;
    }
  }, []);

  const buildXlsx = useCallback(() => {
    // TODO: handle building xlsx for different types
    switch (type) {
      default:
        break;
    }
  }, []);

  return (
    <div className="report-row-container" data-testid={`report-row-${type}`}>
      {/* report title */}
      <h3 className="report-title" data-testid={`report-title-${type}`}>
        {t(`reports.${type}.title`)}
      </h3>
      {/* last updated date */}
      <div className="report-last-updated" data-testid={`last-updated-${type}`}>{`${t(
        'lastUpdated',
      )} ${lastUpdated}`}</div>
      {/* download pdf button */}
      <div className="report-download-pdf-button" data-testid={`download-pdf-${type}`}>
        <Button iconLeft={downloadIcon} onClick={buildPdf} disabled={true}>
          {t('downloadPdf', { name: t(`reports.${type}.documentName`) })}
        </Button>
      </div>
      {/* download xlsx button */}
      <div className="report-download-xlsx-button" data-testid={`download-xlsx-${type}`}>
        <Button iconLeft={downloadIcon} variant="secondary" onClick={buildXlsx} disabled={true}>
          {t('downloadXlsx', { name: t(`reports.${type}.documentName`) })}
        </Button>
      </div>
    </div>
  );
};

export default ReportRow;
