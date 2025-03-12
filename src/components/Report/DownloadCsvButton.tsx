import { Button, ButtonVariant, IconDownload } from 'hds-react';
import { FC, memo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Reports,
  IDownloadCsvButtonProps,
  IConstructionProgramCsvRow,
  IBudgetBookSummaryCsvRow,
  IOperationalEnvironmentAnalysisSummaryCsvRow,
} from '@/interfaces/reportInterfaces';
import './styles.css';

import { useCsvData } from '@/hooks/useCsvData';
import { downloadCSV } from '@/utils/csvUtils';

const downloadIcon = <IconDownload />;

const DownloadCsvButton: FC<IDownloadCsvButtonProps> = ({
  type,
  getForcedToFrameData,
  getPlanningData,
  getPlanningRows,
  getCategories,
}) => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const { getCsvData } = useCsvData({
    type,
    getForcedToFrameData,
    getPlanningData,
    getPlanningRows,
    getCategories,
  });
  const navigate = useNavigate();

  const cleanData = (data: (
    IConstructionProgramCsvRow
    | IBudgetBookSummaryCsvRow
    | IOperationalEnvironmentAnalysisSummaryCsvRow
  )[]) => {
    return data.map((row) => {
      return Object.keys(row).reduce((acc, key) => {
        const typedKey = key as keyof (IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow | IOperationalEnvironmentAnalysisSummaryCsvRow);
        if (key === '\nTS 2025' || key === '\nTA 2025') {
          const value = (row[typedKey] ?? '') as string;
          acc[typedKey] = value ? value.replace(/\s/g, '') : '';
        } else {
          acc[typedKey] = row[typedKey] ?? '';
        }
        return acc;
      }, {} as IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow | IOperationalEnvironmentAnalysisSummaryCsvRow);
    });
  };

  const handleDownloadClick = async () => {
    try {
      let data = await getCsvData();

      if (data && data.length > 0) {
        data = cleanData(data);
        const documentName = t(`report.${type}.documentName`);
        downloadCSV(
          data,
          `${documentName} ${
            ['strategy', 'strategyForcedToFrame', 'forecastReport'].includes(type) ? year + 1 : year
          }.csv`,
        );
      } else {
        console.warn('No data available for CSV download.');
      }
    } catch (error) {
      console.error('Error during CSV download:', error);
    } finally {
      // Workaround: Reload the page after downloading Strategy report
      // If the Strategy report with ForcedToFrame data is downloaded after coord. data
      // without refreshing the page, the report is fetched from cache and will show incorrect data.
      if ([
        Reports.Strategy,
        Reports.StrategyForcedToFrame,
        Reports.ForecastReport,
        Reports.OperationalEnvironmentAnalysis,
        Reports.OperationalEnvironmentAnalysisForcedToFrame
      ].includes(type as Reports)) navigate(0);
    }
  };

  return (
    <div className="report-download-csv-button" data-testid={`download-csv-${type}`}>
      <Button
        iconStart={downloadIcon}
        variant={ButtonVariant.Secondary}
        onClick={handleDownloadClick}
        disabled={type === Reports.FinancialStatement}
      >
        {t('downloadCsv', { name: t(`report.${type}.documentName`) })}
      </Button>
    </div>
  );
};

export default memo(DownloadCsvButton);
