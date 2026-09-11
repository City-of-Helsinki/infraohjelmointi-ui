type CurrencyValue = string | number | null;

export const parseCurrency = (value?: CurrencyValue): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const normalized =
    value
      ?.replaceAll('€', '')
      .replace(/[\s\u00A0]/g, '')
      .replace(',', '.')
      .trim() ?? '';
  const number = Number(normalized);

  return normalized !== '' && Number.isFinite(number) ? number : null;
};

export const formatBudgetEuro = (value?: CurrencyValue): string => {
  const numericValue = parseCurrency(value);

  if (numericValue === null) {
    return '';
  }

  const formattedValue = new Intl.NumberFormat('fi-FI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(numericValue)
    .replaceAll('\u00A0', ' ');

  return `${formattedValue}€`;
};

export const currencyToRequestValue = (value?: CurrencyValue): string => {
  const parsedValue = parseCurrency(value);

  if (parsedValue === null) {
    return '';
  }

  return parsedValue.toFixed(2);
};
