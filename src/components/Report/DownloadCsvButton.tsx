import { Button, IconDownload } from 'hds-react';
import { FC, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IBudgetBookSummaryCsvRow, IConstructionProgramCsvRow, ReportType, getForcedToFrameDataType, Reports, IPlanningData } from '@/interfaces/reportInterfaces';
import { getReportData } from '@/utils/reportHelpers';
import { CSVDownload } from 'react-csv';
import './styles.css';
import { useAppDispatch } from '@/hooks/common';
import { clearLoading, setLoading } from '@/reducers/loaderSlice';
import { getCoordinationTableRows } from '@/hooks/useCoordinationRows';
import { IPlanningRow } from '@/interfaces/planningInterfaces';
import { IListItem } from '@/interfaces/common';
import { getDistricts } from '@/services/listServices';
import { getProjectDistricts } from '@/reducers/listsSlice';

interface IDownloadCsvButtonProps {
  type: ReportType;
  getForcedToFrameData: (year: number, forcedToFrame: boolean) => getForcedToFrameDataType;
  getPlanningData: (year: number) => Promise<IPlanningData>;
  getPlanningRows: (res: IPlanningData) => IPlanningRow[];
  getCategories: () => Promise<IListItem[]>;
  }

const downloadIcon = <IconDownload />;

/**
 * We're using pdf-react to create pdf's.
 *
 * The styles are a bit funky since pdf-react doesn't support grid or table.
 */
const DownloadCsvButton: FC<IDownloadCsvButtonProps> = ({ type, getForcedToFrameData, getPlanningData, getPlanningRows, getCategories }) => {
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
          // For Strategy report, we will fetch next year data
          const res = type === Reports.Strategy ? await getForcedToFrameData(year + 1, false) : await getForcedToFrameData(year, true);
          if (res && res.projects.length > 0) {
            const coordinatorRows = getCoordinationTableRows(res.classHierarchy, res.forcedToFrameDistricts.districts, res.initialSelections, res.projects, res.groupRes);
            setCsvData(await getReportData(t, type, coordinatorRows));
          }
          break;
        }
        case Reports.OperationalEnvironmentAnalysis: {
          const res = await getForcedToFrameData(year, false);
          const categories = await getCategories();
          if (res && res.projects.length > 0 && categories) {
            const coordinatorRows = getCoordinationTableRows(res.classHierarchy, res.forcedToFrameDistricts.districts, res.initialSelections, res.projects, res.groupRes);
            setCsvData(await getReportData(t, type, coordinatorRows, undefined, undefined, categories, res.projectsInWarrantyPhase));
          }
          break;
        }
        case Reports.ConstructionProgram: {
          const res = await getPlanningData(year + 1);
          const resDivisions = await getDistricts();
          const divisions = getProjectDistricts(resDivisions, "division");
          const subDivisions = getProjectDistricts(resDivisions, "subDivision");

          if (res && res.projects.length > 0) {
            const planningRows = getPlanningRows(res);
            setCsvData(await getReportData(t, Reports.ConstructionProgram, planningRows, divisions, subDivisions));
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
