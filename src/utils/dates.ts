import moment from 'moment';

/**
 * Makes a HDS date into a moment string
 *
 * @param date date string in HDS format
 * @returns
 */
const momentFromHDSDate = (date: string | undefined) => moment(date, 'DD.MM.YYYY');

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
  startDate: string | undefined | null,
  endDate: string | undefined | null,
): boolean => {
  // const startYear = parseInt(startDate?.split('.').pop() || '0');
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
export const addYear = (date: string | undefined | null) =>
  date ? momentFromHDSDate(date).add(1, 'y').format('DD.MM.YYYY') : null;

/**
 * Removes a year from a HDS date string
 *
 * @param date date string in HDS format
 * @returns HDS date with a substracted year
 */
export const removeYear = (date: string | undefined | null) =>
  date ? momentFromHDSDate(date).subtract(1, 'y').format('DD.MM.YYYY') : null;
