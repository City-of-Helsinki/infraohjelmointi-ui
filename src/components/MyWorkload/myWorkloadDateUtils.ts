import moment from 'moment';

const MY_WORKLOAD_DATE_FORMATS = ['DD.MM.YYYY', 'D.M.YYYY', 'YYYY-MM-DD'];

const parseMyWorkloadDate = (date?: string | null) => {
  if (!date) {
    return null;
  }

  const normalizedDate = date.trim().replace(/\s+/g, '');
  const parsed = moment(normalizedDate, MY_WORKLOAD_DATE_FORMATS, true);
  return parsed.isValid() ? parsed : null;
};

export const normalizeMyWorkloadDate = (date?: string | null): string => {
  const parsed = parseMyWorkloadDate(date);
  return parsed ? parsed.format('DD.MM.YYYY') : '';
};

export const formatMyWorkloadDateForDisplay = (date?: string | null): string => {
  const parsed = parseMyWorkloadDate(date);
  return parsed ? parsed.format('D.M.YYYY') : '';
};

export const getMyWorkloadDateTimeValue = (date?: string | null): number => {
  const parsed = parseMyWorkloadDate(date);
  return parsed ? parsed.valueOf() : Number.NEGATIVE_INFINITY;
};
