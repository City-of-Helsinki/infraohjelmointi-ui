import moment from 'moment';

/**
 * Makes a HDS date into a moment string
 *
 * @param date date string in HDS format
 * @returns
 */
const momentFromHDSDate = (date?: string) => moment(date, 'DD.MM.YYYY');

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
  const startYear = startDate ? parseInt(momentFromHDSDate(startDate).format('YYYY')) : 0;
  const endYear = endDate ? parseInt(momentFromHDSDate(endDate).format('YYYY')) : 0;
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
 * Adds a year to a HDS date string
 *
 * @param date date string in HDS format
 * @returns HDS date with an added year
 */
export const addYear = (date?: string | null) =>
  date ? momentFromHDSDate(date).add(1, 'y').format('DD.MM.YYYY') : null;

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
  date ? parseInt(momentFromHDSDate(date).format('YYYY')) : null;

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
  // Create a Moment.js object representing the given month
  const date = moment({ year, month: month - 1 });
  return date.daysInMonth();
};

export const getDayFromDate = (date?: string | null) => {
  if (date) {
    return parseInt(momentFromHDSDate(date).format('D'));
  } else return 0;
};

export const getMonthFromDate = (date?: string | null) => {
  if (date) {
    return parseInt(momentFromHDSDate(date).format('M'));
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
