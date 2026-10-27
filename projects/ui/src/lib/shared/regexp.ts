/**
 * Matches string representations of a date.
 * Consist of 3 parts, separated by hyphens: dd-MMM-yyyy.
 * String should be constructed with:
 *  - 1 or 2 digits for the day
 *  - 2 to 4 characters for the shorten version of the month name
 *  - 4 digits for the year
 *
 * i.e. 01-Jan-2022, 31-Dec-2000
 */
export const AppDateStrRegExp: RegExp = /^\d{1,2}-\S{2,4}-\d{4}$/;

/**
 * This matches a string representation of a date against the expected ISO format.
 * Consist of 3 parts, separated by hyphens: yyyy-mm-dd.
 * Explicity matches:
 *  - 4 digits for the year part up to a value within the range of 0000 to 9999
 *  - 2 digits for the month part to a value within the range of 01 to 12
 *  - 2 digits for the day part to a value within the range of 01 to 31
 *
 * i.e. matches: 2022-01-01, 2000-12-31
 *
 * Note: This should only be used in conjunction of `new Date()` because 2022-02-31
 * passes the regexp test, but will not pass as a valid new date and this should be the only
 * string format that you pass into new Date because is the only implementation agnostic
 * accepted string.
 */
export const isoDateStrRegExp: RegExp = /^\d{4}-(?!00)(0[0-9]|1[0-2])-(?!00)([0-2][0-9]|3[0-1])$/;