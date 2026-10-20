import moment from 'moment';

/**
 * Makes a HDS date into a moment string
 *
 * @param date date string in HDS format
 * @returns
 */
const momentFromHDSDate = (date?: string) => moment(date, 'DD.MM.YYYY');

interface IHDSDateParts {
  year: number;
  month: number;
  day: number;
}

const MAX_CACHE_SIZE = 10000;
const hdsDatePartsCache = new Map<string, IHDSDateParts>();
const daysInMonthCache = new Map<string, number>();

// Parsing with moment is slow and the planning table parses the same dates thousands of times
const getHDSDateParts = (date: string): IHDSDateParts => {
  let parts = hdsDatePartsCache.get(date);
  if (!parts) {
    const parsed = momentFromHDSDate(date);
    parts = {
      year: Number.parseInt(parsed.format('YYYY')),
      month: Number.parseInt(parsed.format('M')),
      day: Number.parseInt(parsed.format('D')),
    };
    if (hdsDatePartsCache.size >= MAX_CACHE_SIZE) {
      hdsDatePartsCache.clear();
    }
    hdsDatePartsCache.set(date, parts);
  }
  return parts;
};

/**
 * Checks if a date range is included in a year
 *
 * @param year number of the current year
 * @param startDate a start date as returned from our API in the format dd.mm.yyyy
 * @param endDate a start date as returned from our API in the format dd.mm.yyyy
 * @returns boolean
 */
export const isInYearRange = (
  year: number,
  startDate?: string | null,
  endDate?: string | null,
): boolean => {
  const startYear = startDate ? getHDSDateParts(startDate).year : 0;
  const endYear = endDate ? getHDSDateParts(endDate).year : 0;
  return startYear && endYear ? year >= startYear && year <= endYear : false;
};

export const getCurrentTime = () =>
  new Intl.DateTimeFormat('en-GB', { timeStyle: 'medium' }).format(new Date());

export const stringToDateTime = (date: string) =>
  new Intl.DateTimeFormat('fi-FI', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(date),
  );

export const dateStringToMoment = (date: string) => moment(date).format('D.M.YYYY');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortArrayByDates = (array: Array<any>, dateProperty: string, reversed?: boolean) => {
  const sortedArray =
    array &&
    [...array]?.sort(
      (a, b) => new Date(a[dateProperty]).valueOf() - new Date(b[dateProperty]).valueOf(),
    );

  return reversed ? [...sortedArray]?.reverse() : sortedArray;
};

/**
 * Adds years to a HDS date string
 *
 * @param date date string in HDS format
 * @param years number of years to add (default 1)
 * @returns HDS date with added years
 */
export const addYears = (date?: string | null, years = 1) =>
  date ? momentFromHDSDate(date).add(years, 'y').format('DD.MM.YYYY') : null;

/**
 * Removes a year from a HDS date string
 *
 * @param date date string in HDS format
 * @returns HDS date with a substracted year
 */
export const removeYear = (date?: string | null) =>
  date ? momentFromHDSDate(date).subtract(1, 'y').format('DD.MM.YYYY') : null;

export const isSameYear = (date: string | null | undefined, year: number) => {
  return getYear(date) === year;
};

/**
 * Returns the last date of the year from a HDS date string
 *
 * @param date date string in HDS format
 * @returns last HDS date of the year mentioned in the HDS date string
 */
export const getLastDate = (date: string | null | undefined) => {
  return date ? moment(momentFromHDSDate(date)).endOf('year').format('DD.MM.YYYY') : null;
};

/**
 * Returns the first date of the year from a HDS date string
 *
 * @param date date string in HDS format
 * @returns first HDS date of the year mentioned in the HDS date string
 */
export const getFirstDate = (date: string | null | undefined) => {
  return date ? moment(momentFromHDSDate(date)).startOf('year').format('DD.MM.YYYY') : null;
};

export const getYear = (date?: string | null): number | null =>
  date ? getHDSDateParts(date).year : null;

export const updateYear = (year: number | undefined, date?: string | null) => {
  if (date && year) {
    return momentFromHDSDate(date).set({ year: year }).format('DD.MM.YYYY');
  }
  return null;
};

/**
 * @param year which year
 * @param month which month (number)
 * @returns amount of days in that month
 */
export const getDaysInMonthForYear = (year: number, month: number): number => {
  const key = `${year}-${month}`;
  let days = daysInMonthCache.get(key);
  if (days === undefined) {
    // Create a Moment.js object representing the given month
    days = moment({ year, month: month - 1 }).daysInMonth();
    if (daysInMonthCache.size >= MAX_CACHE_SIZE) {
      daysInMonthCache.clear();
    }
    daysInMonthCache.set(key, days);
  }
  return days;
};

export const getDayFromDate = (date?: string | null) => {
  if (date) {
    return getHDSDateParts(date).day;
  } else return 0;
};

export const getMonthFromDate = (date?: string | null) => {
  if (date) {
    return getHDSDateParts(date).month;
  } else return 0;
};

export const getMonthToday = () => {
  const today = moment(new Date(), 'D.M.YYYY');
  return parseInt(today.format('M'));
};

export const createDateToStartOfYear = (year?: string | number | null) => {
  return year ? moment(year, 'YYYY').startOf('year').format('DD.MM.YYYY') : null;
};

export const createDateToEndOfYear = (year?: string | number | null) => {
  return year ? moment(year, 'YYYY').endOf('year').format('DD.MM.YYYY') : null;
};

export const getToday = () => moment().format('D.M.YYYY');

/**
 * Returns true if the given start date is before the end date
 */
export const isBefore = (start?: string | null, end?: string | null) => {
  if (start && end) {
    const startMoment = momentFromHDSDate(start);
    const endMoment = momentFromHDSDate(end);
    return moment(startMoment).isBefore(endMoment);
  }
  return true;
};

/**
 * Returns true if the given start date is the same or before the end date
 */
export const isSameOrBefore = (start?: string | null, end?: string | null) => {
  if (start && end) {
    const startMoment = momentFromHDSDate(start);
    const endMoment = momentFromHDSDate(end);
    return moment(startMoment).isSameOrBefore(endMoment);
  }
  return true;
};

/**
 * Formats a date string to HDS format if possible, otherwise returns null
 */
export const formatDateToHds = (date?: string | null) => {
  if (!date) {
    return null;
  }

  const parsed = moment(date, ['YYYY-MM-DD', 'DD.MM.YYYY'], true);
  if (parsed.isValid()) {
    return parsed.format('DD.MM.YYYY');
  }

  const fallback = moment(date);
  return fallback.isValid() ? fallback.format('DD.MM.YYYY') : null;
};
