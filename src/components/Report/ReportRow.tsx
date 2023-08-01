import { Button, IconDownload } from 'hds-react';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
import DownloadPdfButton from './DownloadPdfButton';
import './styles.css';
import './pdfFonts';
import { ILocationHierarchy } from '@/reducers/locationSlice';
import { IClassHierarchy } from '@/reducers/classSlice';

interface IReportRowProps {
  type: ReportType;
  lastUpdated: string;
  // We have to pass classes and locations as props to the react-pdf documents, since they are not wrapped in the redux context
  locations: ILocationHierarchy;
  classes: IClassHierarchy;
}

const ReportRow: FC<IReportRowProps> = ({ type, lastUpdated, locations, classes }) => {
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
        {t(`report.${type}.rowTitle`)}
      </h3>
      {/* last updated date */}
      <div className="report-last-updated" data-testid={`last-updated-${type}`}>{`${t(
        'lastUpdated',
      )} ${lastUpdated}`}</div>
      {/* download pdf button */}
      <DownloadPdfButton type={type} locations={locations} classes={classes} />
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
