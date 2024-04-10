import { Button, IconDownload } from 'hds-react';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IBudgetBookSummaryCsvRow, IConstructionProgramCsvRow, ReportType, getForcedToFrameDataType, Reports, IPlanningData } from '@/interfaces/reportInterfaces';
import { getReportData } from '@/utils/reportHelpers';
import { CSVDownload } from 'react-csv';
import './styles.css';
import { useAppDispatch } from '@/hooks/common';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import { getCoordinationTableRows } from '@/hooks/useCoordinationRows';
import { IListItem } from '@/interfaces/common';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { ILocation } from '@/interfaces/locationInterfaces';

interface IDownloadCsvButtonProps {
  type: ReportType;
  divisions: Array<ILocation>;
  getForcedToFrameData: (year: number, forcedToFrame: boolean) => getForcedToFrameDataType;
  getPlanningData: (year: number) => Promise<IPlanningData>;
  getPlanningRows: (res: IPlanningData) => IPlanningRow[];
  getCategories: () => Promise<any>;
  }

const downloadIcon = <IconDownload />;

/**
 * We're using pdf-react to create pdf's.
 *
 * The styles are a bit funky since pdf-react doesn't support grid or table.
 */
const DownloadCsvButton: FC<IDownloadCsvButtonProps> = ({ type, divisions, getForcedToFrameData, getPlanningData, getPlanningRows, getCategories }) => {
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

  const getCsvData = async () => {
    try {
      dispatch(setLoading({ text: 'Loading csv data', id: LOADING_CSV_DATA }));
      switch (type) {
        case Reports.BudgetBookSummary:
        case Reports.Strategy: {
          const res = await getForcedToFrameData(year, true);
          if (res && res.projects.length > 0) {
            const coordinatorRows = getCoordinationTableRows(res.classHierarchy, res.forcedToFrameDistricts.districts, res.initialSelections, res.projects, res.groupRes);
            setCsvData(await getReportData(t, type, coordinatorRows, divisions));
          }
          break;
        }
        case Reports.OperationalEnvironmentAnalysis: {
          const res = await getForcedToFrameData(year, false);
          const categories = await getCategories();
          if (res && res.projects.length > 0 && categories) {
            const coordinatorRows = getCoordinationTableRows(res.classHierarchy, res.forcedToFrameDistricts.districts, res.initialSelections, res.projects, res.groupRes);
            setCsvData(await getReportData(t, type, coordinatorRows, divisions, categories));
          }
          break;
        }
        case Reports.ConstructionProgram: {
          const res = await getPlanningData(year);
          if (res && res.projects.length > 0) {
            const planningRows = getPlanningRows(res);
            setCsvData(await getReportData(t, Reports.ConstructionProgram, planningRows, divisions));
          }
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.log("error in loading CSV data: ", e);
    } finally {
      dispatch(clearLoading(LOADING_CSV_DATA));
    }
  };

  return (
    <>
      <div className="report-download-csv-button" data-testid={`download-csv-${type}`}>
        <Button
          iconLeft={downloadIcon}
          variant="secondary"
          onClick={() => getCsvData()}
          disabled={(type === Reports.FinancialStatement)}
        >
          {t('downloadCsv', { name: t(`report.${type}.documentName`) })}
        </Button>
      </div>
      {csvData.length > 0 ? <CSVDownload data={csvData} target="_blank" /> : undefined}
    </>
  );
};

export default memo(DownloadCsvButton);
