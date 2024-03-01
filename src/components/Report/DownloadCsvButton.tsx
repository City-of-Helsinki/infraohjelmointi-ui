import { Button, IconDownload } from 'hds-react';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IBudgetBookSummaryCsvRow, IConstructionProgramCsvRow, ReportType } from '@/interfaces/reportInterfaces';
import { IClassHierarchy, ICoordinatorClassHierarchy } from '@/reducers/classSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import { getReportData } from '@/utils/reportHelpers';
import { CSVDownload } from 'react-csv';
import './styles.css';
import { useAppDispatch } from '@/hooks/common';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';

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
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [csvData, setCsvData] = useState<Array<IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow>>([]);
  const LOADING_CSV_DATA = 'loading-csv-data';

  useEffect(() => {
    if (csvData.length > 0) {
      setCsvData([]);
    }
  }, [csvData]);

  const getCsvData = useCallback(async () => {
    try {
      dispatch(setLoading({ text: 'Loading csv data', id: LOADING_CSV_DATA }));
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
    } catch (e) {
      console.log("error in loading CSV data: ", e);
    } finally {
      dispatch(clearLoading(LOADING_CSV_DATA));
    }
  }, []);

  return (
    <>
      <div className="report-download-csv-button" data-testid={`download-csv-${type}`}>
        <Button
          iconLeft={downloadIcon}
          variant="secondary"
          onClick={getCsvData}
          disabled={(type !== 'constructionProgram' && type !== 'budgetBookSummary')}
        >
          {t('downloadCsv', { name: t(`report.${type}.documentName`) })}
        </Button>
      </div>
      {csvData.length > 0 ? <CSVDownload data={csvData} target="_blank" /> : undefined}
    </>
  );
};

export default memo(DownloadCsvButton);
