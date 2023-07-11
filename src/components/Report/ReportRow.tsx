import { Button } from 'hds-react';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/common';
import './styles.css';

interface IReportRowProps {
  type: ReportType;
  lastUpdated: string;
}

const ReportRow: FC<IReportRowProps> = ({ type, lastUpdated }) => {
  const { t } = useTranslation();

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
      <h3 className="report-title" data-testid={`report-title-${type}`}>
        {t(`reports.${type}.title`)}
      </h3>
      <div className="report-last-updated" data-testid={`last-updated-${type}`}>{`${t(
        'lastUpdated',
      )}: ${lastUpdated}`}</div>
      <div className="report-download-pdf-button" data-testid={`download-pdf-${type}`}>
        <Button onClick={buildPdf} disabled={true}>
          {t('downloadPdf', { name: t(`reports.${type}.documentName`) })}
        </Button>
      </div>
      <div className="report-download-xlsx-button" data-testid={`download-xlsx-${type}`}>
        <Button variant="secondary" onClick={buildXlsx} disabled={true}>
          {t('downloadXlsx', { name: t(`reports.${type}.documentName`) })}
        </Button>
      </div>
    </div>
  );
};

export default ReportRow;
