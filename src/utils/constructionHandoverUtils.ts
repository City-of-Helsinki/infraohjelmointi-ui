import { IConstructionHandoverFinancing } from '@/interfaces/constructionHandoverInterfaces';
import { TFunction } from 'i18next';

export const parseCurrency = (value?: string | number | null): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const normalized =
    value
      ?.replace(/€/g, '')
      .replace(/[\s\u00A0]/g, '')
      .replace(',', '.')
      .trim() ?? '';
  const number = Number(normalized);

  return normalized !== '' && Number.isFinite(number) ? number : null;
};

export const formatBudgetEuro = (value?: string): string => {
  const numericValue = parseCurrency(value);

  if (numericValue === null) {
    return '';
  }

  const formattedValue = new Intl.NumberFormat('fi-FI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(numericValue)
    .replace(/\u00A0/g, ' ');

  return `${formattedValue}€`;
};

export const currencyToRequestValue = (value?: string | number | null): string => {
  const parsedValue = parseCurrency(value);

  if (parsedValue === null) {
    return '';
  }

  return parsedValue.toFixed(2);
};
