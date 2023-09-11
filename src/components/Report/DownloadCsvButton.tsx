import { Button, IconDownload } from 'hds-react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IConstructionProgramTableRow, ReportType } from '@/interfaces/reportInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import { getProjectsWithParams } from '@/services/projectServices';
import { ILocation } from '@/interfaces/locationInterfaces';
import { getReportRows } from '@/utils/reportHelpers';
import { CSVDownload } from 'react-csv';
import { TFunction } from 'i18next';
import './styles.css';

/**
 * Create a flattened version of construction program table rows, since the react-csv needs a one-dimensional array
 */
const flattenConstructionProgramTableRows = (arr: Array<IConstructionProgramTableRow>) => {
  const result: Array<IConstructionProgramTableRow> = [];

  function flattenRecursive(input: Array<IConstructionProgramTableRow>) {
    for (const item of input) {
      result.push(item);

      if (item.projects.length > 0) {
        item.projects.forEach((p: IConstructionProgramTableRow) => result.push(p));
      }

      if (item.children.length > 0) {
        flattenRecursive(item.children);
      }
    }
  }

  flattenRecursive(arr);

  return result;
};

interface IConstructionProgramCsvRow {
  [key: string]: string;
}

interface IDownloadCsvButtonProps {
  type: ReportType;
  divisions: Array<ILocation>;
  classes: IClassHierarchy;
}

const getConstructionProgramReportData = async (
  classes: IClassHierarchy,
  divisions: Array<ILocation>,
  t: TFunction<'translation', undefined>,
): Promise<Array<IConstructionProgramCsvRow>> => {
  const projects = await getProjectsWithParams({
    direct: false,
    programmed: false,
    params: 'overMillion=true',
  })
    .then((res) => res.results)
    .catch((e) => {
      console.log('Error downloading CSV: ', e);
      return [];
    });

  if (projects) {
    // Get report rows the same way as for the pdf table
    const reportRows = getReportRows(projects, classes, divisions);
    // Flatten rows into one dimension
    const flattenedRows = flattenConstructionProgramTableRows(reportRows);
    // Transform them into csv rows
    const csvRows = flattenedRows.map((r: IConstructionProgramTableRow) => ({
      [t('target')]: r.name,
      [t('content')]: r.location,
      [`${t('costForecast')} ${t('millionEuro')}`]: r.costForecast,
      [`${t('planningAnd')} ${t('constructionTiming')}`]: r.startAndEnd,
      [t('previouslyUsed')]: r.spentBudget,
      [`TAE ${new Date().getFullYear()}`]: r.budgetProposalCurrentYearPlus0,
      [`TSE ${new Date().getFullYear() + 1}`]: r.budgetProposalCurrentYearPlus1,
      [`TSE ${new Date().getFullYear() + 2}`]: r.budgetProposalCurrentYearPlus2,
    }));

    return csvRows;
  }

  return [];
};

/**
 * We're using pdf-react to create pdf's.
 *
 * The styles are a bit funky since pdf-react doesn't support grid or table.
 */
const DownloadCsvButton: FC<IDownloadCsvButtonProps> = ({ type, divisions, classes }) => {
  const { t } = useTranslation();
  const [csvData, setCsvData] = useState<Array<IConstructionProgramCsvRow>>([]);

  const downloadIcon = useMemo(() => <IconDownload />, []);

  useEffect(() => {
    if (csvData.length > 0) {
      setCsvData([]);
    }
  }, [csvData]);

  const getCsvData = useCallback(async () => {
    switch (type) {
      case 'constructionProgram':
        setCsvData(await getConstructionProgramReportData(classes, divisions, t));
        break;
      default:
        // implemented later...
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
          disabled={type !== 'constructionProgram'}
        >
          {t('downloadXlsx', { name: t(`report.${type}.documentName`) })}
        </Button>
      </div>
      {csvData.length > 0 ? <CSVDownload data={csvData} target="_blank" /> : undefined}
    </>
  );
};

export default DownloadCsvButton;
