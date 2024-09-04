import {
  IBudgetBookSummaryCsvRow,
  IConstructionProgramCsvRow,
} from '@/interfaces/reportInterfaces';

export const downloadCSV = (
  dataArray: (IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow)[],
  filename = 'report.csv',
) => {
  const csvString = arrayToCSV(dataArray);
  const blob = new Blob([csvString], { type: 'text/csv' });
  const link = document.createElement('a');
  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const arrayToCSV = (
  dataArray: (IConstructionProgramCsvRow | IBudgetBookSummaryCsvRow)[],
) => {
  const headers = Object.keys(dataArray[0])
    .map((field) => `"${field}"`) // Wrap every field in quotes for consistency
    .join(',');
  const rows = dataArray.map((row) =>
    Object.values(row)
      .map(
        (value) =>
          typeof value === 'string' && value.includes('\n')
            ? `"${value.replace(/"/g, '""')}"` // Handle multiline values by wrapping them in quotes and escaping existing quotes
            : `"${value}"`, // Wrap every field in quotes for consistency
      )
      .join(','),
  );
  return [headers, ...rows].join('\n');
};
