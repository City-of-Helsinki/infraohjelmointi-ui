import { FC } from 'react';
import { Option, Select, SelectData, SupportedLanguage } from 'hds-react';
import { useTranslation } from 'react-i18next';

const currentYear = new Date().getFullYear();

interface IReportYearSelectProps {
  value: string;
  onChange: (selectedOptions: Option[], clickedOption: Option, data: SelectData) => void;
  className?: string;
}

const ReportYearSelect: FC<IReportYearSelectProps> = ({
  value,
  onChange,
  className,
}) => {
  const { i18n, t } = useTranslation();

  const startYear = currentYear - 1;
  const yearOptions = Array.from({ length: 12 }, (_, i) => startYear + i).map((year) => ({
    label: year.toString(),
  }));

  return (
    <Select
      id="report-year-select"
      className={className}
      texts={{
        language: i18n.language as SupportedLanguage,
        label: t('report.yearLabel'),
      }}
      value={value}
      options={yearOptions}
      onChange={onChange}
      clearable={false}
    />
  );
};

export default ReportYearSelect;
