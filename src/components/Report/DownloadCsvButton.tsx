import { Button, IconDownload } from 'hds-react';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IBudgetBookSummaryCsvRow, IConstructionProgramCsvRow, ReportType, getForcedToFrameDataType, Reports } from '@/interfaces/reportInterfaces';
import { IClassHierarchy, ICoordinatorClassHierarchy } from '@/reducers/classSlice';
import { ILocation } from '@/interfaces/locationInterfaces';
import { getReportData } from '@/utils/reportHelpers';
import { CSVDownload } from 'react-csv';
import './styles.css';
import { useAppDispatch } from '@/hooks/common';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import { getCoordinationTableRows } from '@/hooks/useCoordinationRows';

interface IDownloadCsvButtonProps {
  type: ReportType;
  getForcedToFrameData: (year: number) => getForcedToFrameDataType;
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
const DownloadCsvButton: FC<IDownloadCsvButtonProps> = ({ type, getForcedToFrameData, divisions, classes, forcedToFrameClasses }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [csvData, setCsvData] = useState<Array<IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow>>([]);
  const LOADING_CSV_DATA = 'loading-csv-data';
  const year = new Date().getFullYear();

  useEffect(() => {
    if (csvData.length > 0) {
      setCsvData([]);
    }
  }, [csvData]);

  const getCsvData = useCallback(async () => {
    try {
      dispatch(setLoading({ text: 'Loading csv data', id: LOADING_CSV_DATA }));
      switch (type) {
        case Reports.BudgetBookSummary:
        case Reports.Strategy: {
          const res = await getForcedToFrameData(year);
          if (res && res.projects.length > 0) {
            const coordinatorRows = getCoordinationTableRows(res.classHierarchy, res.forcedToFrameDistricts.districts, res.initialSelections, res.projects, res.groupRes);
            setCsvData(await getReportData(forcedToFrameClasses, divisions, t, type, coordinatorRows));
          }
          break;
        }
        case Reports.ConstructionProgram:
          setCsvData(await getReportData(classes, divisions, t, Reports.ConstructionProgram));
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
          disabled={(type !== Reports.ConstructionProgram && type !== Reports.BudgetBookSummary && type !== 'strategy')}
        >
          {t('downloadCsv', { name: t(`report.${type}.documentName`) })}
        </Button>
      </div>
      {csvData.length > 0 ? <CSVDownload data={csvData} target="_blank" /> : undefined}
    </>
  );
};

export default memo(DownloadCsvButton);
