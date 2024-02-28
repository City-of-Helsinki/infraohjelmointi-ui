import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportType } from '@/interfaces/reportInterfaces';
import { IClassHierarchy, ICoordinatorClassHierarchy } from '@/reducers/classSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import DownloadPdfButton from './DownloadPdfButton';
import DownloadCsvButton from './DownloadCsvButton';
import './styles.css';
import './pdfFonts';

interface IReportRowProps {
  type: ReportType;
  // We have to pass classes and locations as props to the react-pdf documents, since they are not wrapped in the redux context
  divisions: Array<ILocation>;
  classes: IClassHierarchy;
  forcedToFrameClasses: ICoordinatorClassHierarchy;
}

const ReportRow: FC<IReportRowProps> = ({ type, divisions, classes, forcedToFrameClasses }) => {
  const { t } = useTranslation();

  return (
    <div className="report-row-container" data-testid={`report-row-${type}`}>
      {/* report title */}
      <h3 className="report-title" data-testid={`report-title-${type}`}>
        {t(`report.${type}.rowTitle`)}
      </h3>
      {/* download pdf button */}
      <DownloadPdfButton type={type} divisions={divisions} classes={classes} forcedToFrameClasses={forcedToFrameClasses} />
      {/* download csv button */}
      <DownloadCsvButton type={type} divisions={divisions} classes={classes} forcedToFrameClasses={forcedToFrameClasses} />
    </div>
  );
};

export default ReportRow;
