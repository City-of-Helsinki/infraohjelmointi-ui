import { Button, IconDownload } from 'hds-react';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Reports,
  IDownloadCsvButtonProps,
  IConstructionProgramCsvRow,
  IBudgetBookSummaryCsvRow,
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

  const cleanData = (data: (IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow)[]) => {
    return data.map((row) => {
      return Object.keys(row).reduce((acc, key) => {
        const typedKey = key as keyof (IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow);

        acc[typedKey] = row[typedKey] ?? '';
        return acc;
      }, {} as IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow);
    });
  };

  const handleDownloadClick = async () => {
    try {
      let data = await getCsvData();

      if (data && data.length > 0) {
        data = cleanData(data);
        const documentName = t(`report.${type}.documentName`);
        downloadCSV(data, `${documentName}_${year}.csv`);
      } else {
        console.warn('No data available for CSV download.');
      }
    } catch (error) {
      console.error('Error during CSV download:', error);
    }
  };

  return (
    <div className="report-download-csv-button" data-testid={`download-csv-${type}`}>
      <Button
        iconLeft={downloadIcon}
        variant="secondary"
        onClick={handleDownloadClick}
        disabled={type === Reports.FinancialStatement}
      >
        {t('downloadCsv', { name: t(`report.${type}.documentName`) })}
      </Button>
    </div>
  );
};

export default memo(DownloadCsvButton);
