import { DateFilter } from "./table-filter/table-date-filter/table-date-filter.component";

/**
 * The column to sort by.
 *
 * Type T is the table data objects type.
 *
 * @since 5.2.0
 */
export type SortColumn<T> = keyof T | "";
/**
 * The direction to sort.
 *
 * @since 5.2.0
 */
export type SortDirection = "asc" | "desc" | "null";
/**
 * A type that extends an object for the table data. Gives it a selected and expanded property.
 *
 * Type T is the table data objects type.
 *
 * @since 5.2.0
 */
export type TableData<T> = T & { selected?: boolean; expanded?: boolean };

/**
 * The event emitted when a column is sorted.
 *
 * Type T is the table data objects type.
 *
 * @since 5.2.0
 */
export interface SortEvent<T> {
  /**
   * The column name to sort by. This can be blank or a column name as set by the SortableHeaderDirective.
   */
  column: SortColumn<T>;
  /**
   * The direction to sort. This can be "asc", "desc", or "null".
   */
  direction: SortDirection;
}
/**
 * The config for the table
 *
 * @since 5.2.0
 */
export interface AppTableConfig {
  /**
   * Controls the expandable rows feature. This allows rows to be expanded to show more information.
   */
  expandableRows: boolean;
  /**
   * Controls the selectable rows feature. This allows rows to be selected and also triggers the select all header checkbox.
   */
  selectableRows: boolean;
  /**
   * Determines if the table will be server side or client side.
   *
   * If server side, the table will not handle sorting, filtering, or pagination.
   * The only data that will be passed to the table is the data that should be displayed on a single page given the sorting, filtering, and paging.
   */
  serverSide: boolean;
  /**
   * The url to get the data from.
   */
  url: string;
  /**
   * The name of the table. Used for retrieving the state of the table if it is being saved.
   */
  tableName: string;
  /**
   * Controls the state save feature. This allows the state of the table to be saved in local storage.
   */
  stateSave: boolean;
  /**
   * A quick caption for the table, usually similar to the page name ex: Payments pending approval. This is used for accessibility.
   */
  tableCaption: string;
  /**
   * A summary of the table for accessibility. Use this space to describe the structure of the table. Ex: This table has 5 columns: name, location, date, status, and amount.
   */
  tableSummary: string;
  /**
   * The height of the table if it should be a fixed height. Enables vertical scrolling. Horizontal scrolling is also enabled if the width of the table is smaller than the content.
   */
  tableHeight?: string;
  /**
   * Activates the row grouping feature. The value should be the column that the rows should be grouped by.
   */
  groupRow?: string;
}

/**
 * A representative of a single filter query.
 *
 * @since 5.2.0
 */
export interface SearchQuery {
  /**
   * The coloumn name to filter by. As set by the SortableHeaderDirective.
   */
  column: string;
  /**
   * The value to filter by.
   */
  value: string | boolean | DateFilter | string[];
  /**
   * The type of filter.
   */
  type: "text" | "number" | "date" | "select" | "multi-select" | "checkbox";
}

/**
 * The state of the table.
 *
 * Type T is the table data objects type.
 *
 * @since 5.2.0
 */
export interface State<T> {
  /**
   * The current page number of the table.
   */
  page: number;
  /**
   * The number of records to display per page.
   */
  pageSize: number;
  /**
   * The search terms for the table.
   */
  searchTerms: SearchTerms;
  /**
   * The sort column for the table.
   */
  sortColumn: SortColumn<T>;
  /**
   * The sort direction for the table.
   */
  sortDirection: SortDirection;
}

/**
 * The general stats of the table data for pagination.
 *
 * @since 5.2.0
 */
export interface TableStats {
  /**
   * The start index of the data.
   */
  start: number;
  /**
   * The end index of the data.
   */
  end: number;
  /**
   * The total number of records before filtering.
   */
  totalRecords: number;
  /**
   * The number of records after filtering.
   */
  filteredRecords: number;
}

/**
 * A representation of a single filter query.
 *
 * @since 5.2.0
 */
export interface SearchTerms {
  /**
   * The key is the name of the column to filter.
   * The filterType is the type of the filter.
   * The filterValue is the value to filter by.
   */
  [key: string]: {
    filterType: "text" | "number" | "date" | "select" | "multi-select" | "checkbox";
    filterValue: string | boolean | DateFilter | string[];
  };
}
/**
 * ngSelect items
 *
 * @since 5.2.0
 */
export interface ngSelectItems {
  /**
   * The value of the select item.
   */
  value: string;
  /**
   * The label of the select item.
   */
  label: string;
}
/**
 * Full data object for the table data.
 *
 * Type T is the table data objects type.
 *
 * @since 5.2.0
 */
export interface TableDataObject<T> {
  /**
   * The data to display in the table.
   *
   * Type T is the table data objects type.
   */
  data: T[];
  /**
   * The total number of records after filtering.
   */
  filteredRecordsLength: number;
  /**
   * The start index of the data.
   */
  start: number;
  /**
   * The end index of the data.
   */
  end: number;
  /**
   * The total number of records before filtering.
   */
  totalRecords: number;
}
