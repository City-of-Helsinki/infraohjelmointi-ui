import { Button, IconDownload } from 'hds-react';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IBudgetBookSummaryCsvRow, IConstructionProgramCsvRow, ReportType } from '@/interfaces/reportInterfaces';
import { IClassHierarchy, ICoordinatorClassHierarchy } from '@/reducers/classSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import { getReportData } from '@/utils/reportHelpers';
import { CSVDownload } from 'react-csv';
import './styles.css';

interface IDownloadCsvButtonProps {
  type: ReportType;
  divisions: Array<ILocation>;
  classes: IClassHierarchy;
  forcedToFrameClasses: ICoordinatorClassHierarchy;
}

const downloadIcon = <IconDownload />;

/**
 * We're using pdf-react to create pdf's.
 *
 * The styles are a bit funky since pdf-react doesn't support grid or table.
 */
const DownloadCsvButton: FC<IDownloadCsvButtonProps> = ({ type, divisions, classes, forcedToFrameClasses }) => {
  const { t } = useTranslation();
  const [csvData, setCsvData] = useState<Array<IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow>>([]);

  useEffect(() => {
    if (csvData.length > 0) {
      setCsvData([]);
    }
  }, [csvData]);

  const getCsvData = useCallback(async () => {
    switch (type) {
      case 'constructionProgram':
        setCsvData(await getReportData(classes, divisions, t, 'constructionProgram'));
        break;
      case 'budgetBookSummary':
        setCsvData(await getReportData(forcedToFrameClasses, divisions, t, 'budgetBookSummary'));
        break;
      default:
        // In the MVP stage we only had time to implement the construction program report, the other
        // report cases should come here
        break;
    }
  }, []);

  return (
    <>
      <div className="report-download-xlsx-button" data-testid={`download-xlsx-${type}`}>
        <Button
          iconLeft={downloadIcon}
          variant="secondary"
          onClick={getCsvData}
          disabled={(type !== 'constructionProgram' && type !== 'budgetBookSummary')}
        >
          {t('downloadXlsx', { name: t(`report.${type}.documentName`) })}
        </Button>
      </div>
      {csvData.length > 0 ? <CSVDownload data={csvData} target="_blank" /> : undefined}
    </>
  );
};

export default memo(DownloadCsvButton);
