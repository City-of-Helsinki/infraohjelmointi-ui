import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import DownloadPdfButton from './DownloadPdfButton';
import DownloadCsvButton from './DownloadCsvButton';
import './styles.css';
import './pdfFonts';

interface IReportRowProps {
  type: ReportType;
  lastUpdated: string;
  // We have to pass classes and locations as props to the react-pdf documents, since they are not wrapped in the redux context
  divisions: Array<ILocation>;
  classes: IClassHierarchy;
}

const ReportRow: FC<IReportRowProps> = ({ type, lastUpdated, divisions, classes }) => {
  const { t } = useTranslation();

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
      <DownloadPdfButton type={type} divisions={divisions} classes={classes} />
      {/* download csv button */}
      <DownloadCsvButton type={type} divisions={divisions} classes={classes} />
    </div>
  );
};

export default ReportRow;
