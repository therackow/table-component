import { i18nMonths } from "../i18n-months";
import { isoDateStrRegExp } from "./regexp";

/**
 * Function that takes any set of characters and checks to see if it is an integer.
 *
 * @param value Any character(s) to test.
 * @example
 * // returns true
 * isNumber(12)
 * @example
 * // returns true
 * isNumber('12')
 * @example
 * // returns false
 * isNumber('twelve')
 * @returns boolean of whether or not your value is an integer.
 */
export function isNumber(value: any): value is number {
  return !isNaN(toInteger(value));
}

/**
 * Converts a string to a base 10 integer. Removing decimals where needed.
 *
 * @param value string or set of characters to convert.
 * @example
 * // returns 12
 * isNumber('12')
 * @example
 * // returns 10
 * isNumber('10.23')
 * @example
 * // returns 10
 * isNumber('10.95')
 * @returns The rounded int representation. Returns `NaN` if value is not a number.
 */
export function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

/**
 * Take a JS Date and format it to match our standard.
 *
 * @param value The JS Date of the entered data.
 * @param locale What language will the date be displayed in.
 * @example
 * // returns 29-AUG-2022
 * makeAppDate(Date('29-08-2022'), 'en');
 * @example
 * // returns 03-MRT-2022
 * makeAppDate(Date('03-03-2022'), 'nl');
 * @returns The App date equivalent to the provided date, translated into whatever language was specified.
 */
export function makeAppDate(value: Date, locale: string, useUTC: boolean = true): string {
  const month: number = useUTC ? value.getUTCMonth() : value.getMonth();
  let dateString: string | number = useUTC ? value.getUTCDate() : value.getDate().toString();
  dateString = padZero(dateString);

  const year: number = useUTC ? value.getUTCFullYear() : value.getFullYear();
  const formattedDate: string = `${dateString}-${i18nMonths[locale].shortMonths[month]}-${year}`;

  return formattedDate.toUpperCase();
}

/**
 * Takes a string value representing an ISO date without time and checks to make sure it is a valid date.
 *
 * @param value string representation of ISO date to check
 * @example
 * // returns Date('2022-01-03')
 * isValidIsoDate('2022-01-03')
 * @example
 * // returns null
 * isValidIsoDate('2022-01-03T14:48:00.000Z')
 * @example
 * // returns null
 * isValidIsoDate('10-JAN-2022')
 * @returns Date object representation of input or null if invalid date
 */
export function isValidIsoDate(value: string): Date {
  const date: Date = new Date(value);
  if (date.toString() === "Invalid Date") {
    return null;
  }

  if (!isoDateStrRegExp.test(value)) {
    return null;
  }

  // We need to make sure that certain values don't roll over in certain browsers.
  const dateParts: string[] = value.split("-");
  if (
    date.getUTCDate() !== Number(dateParts[2]) ||
    date.getUTCMonth() + 1 !== Number(dateParts[1]) ||
    date.getUTCFullYear() !== Number(dateParts[0])
  ) {
    return null;
  }

  return date;
}

/**
 * Checks if your value is a number and adds a leading zero if the number is between 0 and 10.
 *
 * @param value Value to pad
 * @example
 * // returns 12
 * padZero(12)
 * @example
 * // returns '02'
 * padZero(2)
 * @example
 * // returns 'Green is not a number!'
 * padZero('Green')
 * @returns either a string of the padded number or the number unpadded.
 */
export function padZero(value: string | number): string | number {
  if (isNaN(Number(value))) {
    return value + " is not a number!";
  }

  value = Number(value);

  if (value < 10 && value >= 0) {
    value = "0" + value;

    return value;
  }

  return value;
}