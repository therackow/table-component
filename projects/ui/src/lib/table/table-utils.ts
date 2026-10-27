import { SortColumn, SortDirection, TableData } from "./table-types";

/**
 * Rotates the sort direction
 *
 * @export
 * @param direction "asc" | "desc" | "null"
 * @returns SortDirection
 * @since 5.2.0
 */
export const rotate: { [key: string]: SortDirection } = { asc: "desc", desc: "null", null: "asc" };

/**
 * Compares two values
 *
 * @export
 * @param v1 first value to compare
 * @param v2 second value to compare
 * @returns number for sorting
 * @since 5.2.0
 */
export const compare: (v1: any, v2: any) => 1 | -1 | 0 = (v1: any, v2: any) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

/**
 * Sorts the data based on the column and direction
 *
 * @export
 * @template T
 * @param data The table data getting sorted
 * @param column The column of the data to sort by
 * @param direction The direction to sort the data
 * @returns The sorted data
 * @since 5.2.0
 */
export function sort<T>(data: TableData<T>[], column: SortColumn<T>, direction: string): TableData<T>[] {
  if (direction === "null" || column === "") {
    return data;
  }

  return [...data].sort((a, b) => {
    const res: 1 | -1 | 0 = compare(a[column], b[column]);

    return direction === "asc" ? res : -res;
  });
}
