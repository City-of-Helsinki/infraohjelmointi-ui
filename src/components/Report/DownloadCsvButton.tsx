import { Button, IconDownload } from 'hds-react';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IConstructionProgramTableRow, ReportType } from '@/interfaces/reportInterfaces';
import { IClassHierarchy } from '@/reducers/classSlice';
import { getProjectsWithParams } from '@/services/projectServices';
import { ILocation } from '@/interfaces/locationInterfaces';
import { getReportRows } from '@/utils/reportHelpers';
import { CSVDownload } from 'react-csv';
import { TFunction } from 'i18next';
import './styles.css';

const flatten = (a: IConstructionProgramTableRow): Array<IConstructionProgramTableRow> => [
  a,
  ...a.projects,
  ...(a.children.map(flatten) as unknown as Array<IConstructionProgramTableRow>),
];

/**
 * Create a flattened version of construction program table rows, since the react-csv needs a one-dimensional array
 */
const flattenConstructionProgramTableRows = (
  tableRows: Array<IConstructionProgramTableRow>,
): Array<IConstructionProgramTableRow> =>
  tableRows.map(flatten).flat(Infinity) as Array<IConstructionProgramTableRow>;
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
  const year = new Date().getFullYear();

  try {
    const res = await getProjectsWithParams({
      direct: false,
      programmed: false,
      params: 'overMillion=true',
      forcedToFrame: false,
      year,
    });

    const projects = res.results;

    if (!projects) {
      return [];
    }

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
  } catch (e) {
    console.log('Error building csv rows: ', e);
    return [];
  }
};

const downloadIcon = <IconDownload />;

/**
 * We're using pdf-react to create pdf's.
 *
 * The styles are a bit funky since pdf-react doesn't support grid or table.
 */
const DownloadCsvButton: FC<IDownloadCsvButtonProps> = ({ type, divisions, classes }) => {
  const { t } = useTranslation();
  const [csvData, setCsvData] = useState<Array<IConstructionProgramCsvRow>>([]);

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
          disabled={type !== 'constructionProgram'}
        >
          {t('downloadXlsx', { name: t(`report.${type}.documentName`) })}
        </Button>
      </div>
      {csvData.length > 0 ? <CSVDownload data={csvData} target="_blank" /> : undefined}
    </>
  );
};

export default memo(DownloadCsvButton);
