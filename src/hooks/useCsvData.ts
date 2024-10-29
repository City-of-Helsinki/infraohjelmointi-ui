import { useState } from 'react';
import { useAppDispatch } from '@/hooks/common';
import { setLoading, clearLoading } from '@/reducers/loaderSlice';
import { getReportData } from '@/utils/reportHelpers';
import { useTranslation } from 'react-i18next';

import {
  Reports,
  IDownloadCsvButtonProps,
  IConstructionProgramCsvRow,
  IBudgetBookSummaryCsvRow,
} from '@/interfaces/reportInterfaces';
import { getCoordinationTableRows } from './useCoordinationRows';
import { getDistricts } from '@/services/listServices';
import { getProjectDistricts } from '@/reducers/listsSlice';

export const useCsvData = ({
  type,
  getForcedToFrameData,
  getPlanningData,
  getPlanningRows,
  getCategories,
}: IDownloadCsvButtonProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [csvData, setCsvData] = useState<
    Array<IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow>
  >([]);
  const LOADING_CSV_DATA = 'loading-csv-data';
  const year = new Date().getFullYear();

  const getCsvData = async () => {
    try {
      dispatch(setLoading({ text: 'Loading csv data', id: LOADING_CSV_DATA }));
      let data: Array<IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow> = [];

      switch (type) {
        case Reports.BudgetBookSummary:
        case Reports.Strategy: {
          // For Strategy report, we will fetch next year data
          const res = type === Reports.Strategy ? await getForcedToFrameData(year + 1, false) : await getForcedToFrameData(year, true);
          if (res && res.projects.length > 0) {
            const coordinatorRows = getCoordinationTableRows(
              res.classHierarchy,
              res.forcedToFrameDistricts.districts,
              res.initialSelections,
              res.projects,
              res.groupRes,
            );
            data = await getReportData(t, type, coordinatorRows);
          }
          break;
        }
        case Reports.OperationalEnvironmentAnalysis: {
          const res = await getForcedToFrameData(year, false);
          const categories = await getCategories();
          if (res && res.projects.length > 0 && categories) {
            const coordinatorRows = getCoordinationTableRows(
              res.classHierarchy,
              res.forcedToFrameDistricts.districts,
              res.initialSelections,
              res.projects,
              res.groupRes,
            );
            data = await getReportData(
              t,
              type,
              coordinatorRows,
              undefined,
              undefined,
              categories,
              res.projectsInWarrantyPhase,
            );
          }
          break;
        }
        case Reports.ConstructionProgram: {
          const res = await getPlanningData(year + 1);
          const resDivisions = await getDistricts();
          const divisions = getProjectDistricts(resDivisions, 'division');
          const subDivisions = getProjectDistricts(resDivisions, 'subDivision');

          if (res && res.projects.length > 0) {
            const planningRows = getPlanningRows(res);
            data = await getReportData(
              t,
              Reports.ConstructionProgram,
              planningRows,
              divisions,
              subDivisions,
            );
          }
          break;
        }
        default:
          break;
      }

      setCsvData(data);
      return data;
    } catch (e) {
      console.log('error in loading CSV data: ', e);
    } finally {
      dispatch(clearLoading(LOADING_CSV_DATA));
    }
  };

  return { getCsvData, csvData };
};