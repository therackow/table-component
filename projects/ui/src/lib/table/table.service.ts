import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { delay, map, switchMap, tap } from "rxjs/operators";

import {
  TableStats,
  SearchTerms,
  State,
  SearchQuery,
  SortColumn,
  SortDirection,
  TableData,
  TableDataObject,
} from "./table-types";
import { sort } from "./table-utils";

/**
 * Service that controls a lot of the table functionality.
 *
 * @since 5.2.0
 */
@Injectable()
export class TableService<T> {
  /**
   * The URL to fetch data from.
   *
   * @public
   * @type {string}
   */
  public url: string = "";

  /**
   * Is the table processing filters, searching and pagination on the server?
   *
   * @public
   * @type {boolean}
   */
  public serverSide: boolean;

  /**
   * The name of the table that can act as an identifier.
   *
   * @public
   * @type {string}
   */
  public tableName: string;

  /**
   * Is the table state being saved?
   *
   * @public
   * @type {boolean}
   */
  public stateSave: boolean;

  /**
   * The property of the data that will be grouped in rows, this will also disable all table sorting.
   *
   * @public
   * @type {string | null}
   */
  public groupRow: string | null;

  /**
   * Observable to track all the rows that have been selected.
   *
   * @public
   * @type {Observable<TableData<T>[]>}
   */
  public selectedRows$: Observable<TableData<T>[]>;

  /**
   * Observable to watch for the select all checkbox being checked.
   *
   * @public
   * @type {Observable<boolean>}
   */
  public selectAll$: Observable<boolean>;

  /**
   * Observable to watch for updates to the table data.
   *
   * @public
   * @type {Observable<TableData<T>[]>}
   */
  public data$: Observable<TableData<T>[]>;

  /**
   * Observable to track whether or not the table is currently being filtered.
   *
   * @public
   * @type {Observable<boolean>}
   */
  public filteredTable$: Observable<boolean>;

  /**
   * Observable to track whether or not data is loading.
   *
   * @public
   * @type {Observable<boolean>}
   */
  public loading$: Observable<boolean>;

  /**
   * Observable to track whether or not any rows are selected.
   *
   * @public
   * @type {Observable<boolean>}
   */
  public anyRowsSelected$: Observable<boolean>;

  /**
   * Observable to track the table stats.
   *
   * @public
   * @type {Observable<TableStats>}
   */
  public tableStats$: Observable<TableStats>;

  /**
   * Observable to track the filter state restore.
   *
   * @public
   * @type {Observable<SearchTerms>}
   */
  public filterStateRestore$: Observable<SearchTerms>;

  // Collection of rows that are currently selected.
  private selectedRowsSource: Subject<TableData<T>[]> = new Subject();
  // Whether or not the select all checkbox is checked.
  private selectAllSource: Subject<boolean> = new Subject();
  // The current table data.
  private dataSource: Subject<TableData<T>[]> = new Subject<TableData<T>[]>();
  // Whether or not the table is currently being filtered.
  private filteredTableSource: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // Whether or not the table is currently loading data.
  private loadingSource: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  // Whether or not any rows are selected.
  private anyRowsSelectedSource: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // The current table page stats.
  private tableStatsSource: BehaviorSubject<TableStats> = new BehaviorSubject<TableStats>({
    start: 0,
    end: 0,
    totalRecords: 0,
    filteredRecords: 0,
  });
  // The current filter restore state.
  private filterStateRestoreSource: Subject<SearchTerms> = new Subject<SearchTerms>();
  /**
   * Subject to trigger a search, filtering and pagination. Local processing only.
   *
   * @private
   * @type {Subject<void>}
   */
  private search: Subject<void> = new Subject<void>();
  /**
   * The full table data before any filtering. Local processing only.
   *
   * @private
   * @type {TableData<T>[]}
   */
  private initialData: TableData<T>[] = [];
  /**
   * The current state of the table.
   *
   * @private
   * @type {State<T>}
   */
  private tableState: State<T> = {
    page: 1,
    pageSize: 6,
    searchTerms: {},
    sortColumn: "",
    sortDirection: "null",
  };

  // Debounce timeout for the search
  private debounceTimeout: number | undefined;
  // Debounce timeout for the filter state restore
  private filterRestoreDebounceTimeout: number | undefined;

  public constructor(private httpClient: HttpClient) {
    this.selectedRows$ = this.selectedRowsSource.asObservable();
    this.selectAll$ = this.selectAllSource.asObservable();
    this.data$ = this.dataSource.asObservable();
    this.filteredTable$ = this.filteredTableSource.asObservable();
    this.loading$ = this.loadingSource.asObservable();
    this.anyRowsSelected$ = this.anyRowsSelectedSource.asObservable();
    this.tableStats$ = this.tableStatsSource.asObservable();
    this.filterStateRestore$ = this.filterStateRestoreSource.asObservable();

    this.search
      .pipe(
        tap(() => this.loadingSource.next(true)),
        switchMap(() => this.localSearch()),
        tap(() => this.loadingSource.next(false)),
      )
      .subscribe((result) => {
        this.dataSource.next(result.data);
        this.tableStatsSource.next({
          start: result.start,
          end: result.end,
          totalRecords: result.totalRecords,
          filteredRecords: result.filteredRecordsLength,
        });
      });
  }

  // Getters and setters for the table page
  public get page(): number {
    return this.tableState.page;
  }
  public set page(page: number) {
    this.set({ page });
  }

  // Getters and setters for the table page size
  public get pageSize(): number {
    return this.tableState.pageSize;
  }
  public set pageSize(pageSize: number) {
    this.set({ pageSize, page: 1 });
  }

  // Setters for the table sorting
  public set sortColumn(sortColumn: SortColumn<T>) {
    this.set({ sortColumn });
  }
  public set sortDirection(sortDirection: SortDirection) {
    this.set({ sortDirection });
  }

  /**
   * Set the data for the table. This will trigger a search, filtering and pagination if the table is not server side.
   *
   * @public
   * @param data the data object to set. If the table is local processing: you dont need to pass start, end, total_records, filtered_records.
   */
  public setData(masterObject: TableDataObject<T>): void {
    if (this.serverSide) {
      this.dataSource.next(masterObject["data"]);
      this.tableStatsSource.next({
        start: masterObject.start,
        end: masterObject.end,
        totalRecords: masterObject.totalRecords,
        filteredRecords: masterObject.filteredRecordsLength,
      });
    } else {
      this.initialData = masterObject["data"];
      this.search.next();
    }
    this.loadingSource.next(false);
  }

  /**
   * When rows are selected, push out the selected rows to any subscribers.
   * Check if any rows are selected and push out the result as well.
   *
   * @public
   * @param selectedRows The rows that are currently selected.
   */
  public onSelectedRowsChanged(selectedRows: TableData<T>[]): void {
    this.selectedRowsSource.next(selectedRows);
    if (selectedRows.length === 0) {
      this.anyRowsSelectedSource.next(false);
    } else {
      this.anyRowsSelectedSource.next(true);
    }
  }

  /**
   * When the select all checkbox is updated, push out the value to any subscribers.
   * Push out the same value to the anyRowsSelectedSource as well since select all will select or deselect all rows.
   *
   * @public
   * @param value The value of the select all checkbox.
   */
  public onSelectAllChanged(value: boolean): void {
    this.selectAllSource.next(value);
    this.anyRowsSelectedSource.next(value);
  }

  /**
   * Update subscribers on whether or not the table is currently loading data.
   *
   * @public
   * @param loading The loading state of the table.
   */
  public onLoading(loading: boolean): void {
    this.loadingSource.next(loading);
  }

  /**
   * Manage the filtering criteria for the table
   * If the search term is empty, remove it from the table state.
   * Alert subscribers that the table is being filtered if there are any search terms.
   * If the table is server side, fetch the data.
   * If the table is not server side, trigger a local search.
   *
   * @public
   * @param searchTerms The search query to filter the table by.
   */
  public onSearchTermsChanged(searchTerms: SearchQuery): void {
    // Clear the previous timeout if it exists
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    if (
      searchTerms.value === null ||
      searchTerms.value === "" ||
      (Array.isArray(searchTerms.value) && searchTerms.value.length === 0)
    ) {
      delete this.tableState.searchTerms[searchTerms.column];
      if (Object.keys(this.tableState.searchTerms).length === 0) {
        this.filteredTableSource.next(false);
      }
    } else {
      this.tableState.searchTerms[searchTerms.column] = {
        filterValue: searchTerms.value,
        filterType: searchTerms.type,
      };
      this.filteredTableSource.next(true);
    }

    // Set a new timeout
    this.debounceTimeout = window.setTimeout(() => {
      if (this.serverSide) {
        this.fetchData();
      } else {
        this.search.next();
      }

      if (this.saveState) {
        this.saveState(this.tableName);
      }
    }, 300); // delay just a bit so that the user can finish typing before we search
  }

  /**
   * Gather the table state data to send to the server and perform a server side data fetch.
   * This will do the initial data fetch and sort, filter, and paginate the data on the server before returning it to the client.
   *
   * @public
   */
  public fetchData(): void {
    this.loadingSource.next(true);
    // turn off check all
    this.onSelectedRowsChanged([]);
    let stateParams: HttpParams = new HttpParams();
    stateParams = stateParams.append("serverSide", this.serverSide);
    for (const state of Object.keys(this.tableState)) {
      if (state === "searchTerms") {
        stateParams = stateParams.append(state, JSON.stringify(this.tableState[state]));
        continue;
      }
      stateParams = stateParams.append(state, this.tableState[state]);
    }

    this.httpClient
      .get(this.url, { params: stateParams })
      .pipe(
        delay(1000),
        map((resp: any) => ({
          data: resp.data,
          filteredRecordsLength: resp.filtered_records,
          totalRecords: resp.total_records,
          start: resp.start,
          end: resp.end,
        })),
      )
      .subscribe((resp: TableDataObject<T>) => {
        this.setData(resp);
      });
  }

  /**
   * Restore the column filter state.
   * This will then either fetch new data based on the filters and column ordering or trigger a local search.
   *
   * @public
   * @param column The column to restore the filter state for.
   */
  public restoreState(column: string): void {
    // Clear the previous timeout if it exists
    if (this.filterRestoreDebounceTimeout) {
      clearTimeout(this.filterRestoreDebounceTimeout);
    }
    this.onLoading(true);
    const state: State<T> = JSON.parse(sessionStorage.getItem(this.tableName));
    if (state) {
      this.tableState = state; // set the internal state to the restored state
      // If the column is in the restored state, fire the restore source and set the filtered table source to true
      const singleColumnSearchTerm: SearchTerms = Object.keys(this.tableState.searchTerms)
        .filter((key) => key === column)
        .reduce((obj, key) => {
          obj[key] = this.tableState.searchTerms[key];

          return obj;
        }, {} as SearchTerms);
      if (Object.keys(singleColumnSearchTerm).length > 0) {
        this.filterStateRestoreSource.next(singleColumnSearchTerm);
        this.filteredTableSource.next(true);
      }
    }

    this.filterRestoreDebounceTimeout = window.setTimeout(() => {
      if (this.serverSide) {
        this.fetchData();
      } else {
        this.search.next();
      }
    }, 250);
  }

  /**
   * Save the table state to the session storage.
   *
   * @public
   * @param name The table name to save the state under.
   */
  public saveState(name: string): void {
    sessionStorage.setItem(name, JSON.stringify(this.tableState));
  }

  /**
   * Clear the save state session storage.
   *
   * @public
   * @param name The table name to clear the state for.
   */
  public clearState(name: string): void {
    sessionStorage.removeItem(name);
  }

  /**
   * Set a new state for the table.
   * If the table is server side, fetch the data.
   * If the table is not server side, trigger a local search.
   *
   * @private
   * @param patch The new state to set.
   */
  private set(patch: Partial<State<T>>): void {
    Object.assign(this.tableState, patch);
    if (this.serverSide) {
      this.fetchData();
    } else {
      this.search.next();
    }
    if (this.saveState) {
      this.saveState(this.tableName);
    }
  }

  /**
   * Perform a sort, filter, and paginate the local data for the table.
   *
   * @private
   * @returns Observable<TableDataObject<T>>
   */
  private localSearch(): Observable<TableDataObject<T>> {
    const { sortColumn, sortDirection, pageSize, page, searchTerms } = this.tableState;

    const totalRecords: number = this.initialData.length;

    // 1. sort
    let refiniedData: TableData<T>[] = sort(this.initialData, sortColumn, sortDirection);

    // 2. filter
    refiniedData = this.filter(refiniedData, searchTerms);
    const filteredRecordsLength: number = refiniedData.length;

    const pageStart: number = (page - 1) * pageSize;
    const pageEnd: number = pageStart + pageSize;
    // 3. paginate
    refiniedData = this.paginate(refiniedData, pageStart, pageEnd);

    const start: number = pageStart + 1;
    const end: number = start + refiniedData.length - 1;

    return of({ data: refiniedData, filteredRecordsLength, totalRecords, start, end });
  }

  /**
   * Filter the data based on the search terms.
   *
   * @private
   * @param sortedData The data that has been sorted.
   * @param searchTerms The search terms to filter the data by.
   * @returns An array of table data
   */
  private filter(sortedData: TableData<T>[], searchTerms: SearchTerms): TableData<T>[] {
    // turn off check all
    this.onSelectedRowsChanged([]);

    // search
    let filteredData: TableData<T>[] = sortedData;
    for (const key in searchTerms) {
      if (typeof searchTerms[key] !== "undefined") {
        switch (searchTerms[key as keyof SearchTerms].filterType) {
          case "text":
          case "number":
            filteredData = filteredData.filter((item) =>
              item[key].toString().toLowerCase().includes(searchTerms[key].filterValue.toString().toLowerCase()),
            );
            break;
          case "date":
            switch (searchTerms[key].filterValue["dateType"]) {
              case "on":
                if (searchTerms[key].filterValue["dateOne"]) {
                  filteredData = filteredData.filter((item) => item[key] === searchTerms[key].filterValue["dateOne"]);
                }
                break;
              case "before":
                if (searchTerms[key].filterValue["dateOne"]) {
                  filteredData = filteredData.filter((item) => item[key] < searchTerms[key].filterValue["dateOne"]);
                }
                break;
              case "after":
                if (searchTerms[key].filterValue["dateOne"]) {
                  filteredData = filteredData.filter((item) => item[key] > searchTerms[key].filterValue["dateOne"]);
                }
                break;
              case "between":
                if (searchTerms[key].filterValue["dateOne"] && searchTerms[key].filterValue["dateTwo"]) {
                  filteredData = filteredData.filter(
                    (item) =>
                      item[key] >= searchTerms[key].filterValue["dateOne"] &&
                      item[key] <= searchTerms[key].filterValue["dateTwo"],
                  );
                }
                break;
            }
            break;
          case "select":
            filteredData = filteredData.filter((item) => item[key] === searchTerms[key].filterValue);
            break;
          case "multi-select":
            filteredData = filteredData.filter((item) =>
              item[key].some((language) => (searchTerms[key].filterValue as unknown as string[]).includes(language)),
            );
            break;
          case "checkbox":
            filteredData = filteredData.filter((item) => item[key] === searchTerms[key].filterValue);
            break;
        }
      }
    }

    return filteredData;
  }

  /**
   * Paginate the data based on the page size and current page.
   *
   * @private
   * @param filteredData The data that has been filtered.
   * @param start The start index of the page.
   * @param end The end index of the page.
   * @returns An array of table data
   */
  private paginate(filteredData: TableData<T>[], start: number, end: number): TableData<T>[] {
    // paginate
    filteredData = filteredData.map((item, i) => ({ id: i + 1, ...item })).slice(start, end);

    return filteredData;
  }
}
