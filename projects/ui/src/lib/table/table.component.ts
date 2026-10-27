import { DecimalPipe } from "@angular/common";
import {
  AfterContentInit,
  Component,
  ComponentRef,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";

import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import {
  faArrowDownShortWide,
  faArrowUpShortWide,
  faCircleChevronDown,
  faCircleChevronRight,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { AppTableFilterComponent } from "./table-filter/table-filter.component";
import { TableRowCheckboxComponent } from "./table-row-checkbox/table-row-checkbox.component";
import { AppTableConfig, SortColumn, SortDirection, SortEvent, TableData, TableStats } from "./table-types";
import { rotate } from "./table-utils";
import { TableService } from "./table.service";

/**
 * Template directive for the table component.
 *
 * @since 5.2.0
 */
@Directive({
  selector: "[appTemplate]",
})
export class AppTemplateDirective {
  /**
   * The name of the template. Used in the table component to determine which template to use for where.
   *
   * @public
   * @type {(string | undefined)}
   */
  @Input()
  public name: string | undefined;

  public constructor(public template: TemplateRef<any>) {}

  /**
   * Get the type of the template. Essentially just the name at this point but could be expanded in the future.
   *
   * @public
   * @returns the name of the template
   */
  public getType(): string {
    if (this.name === undefined) {
      throw new Error("Name is undefined");
    }

    return this.name;
  }
}

/**
 * Directive that controls the header configuration of the table.
 * Dynamically adds the header check all checkbox and the extra space for the expanding row column if the table is configured to have them.
 *
 * @since 5.2.0
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: "tr[headerConfig]",
})
export class HeaderConfigDirective<T> implements OnInit {
  public constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private table: TableComponent<T>,
    private vcr: ViewContainerRef,
  ) {}

  public ngOnInit(): void {
    const headerRowElement: HTMLElement = this.elRef.nativeElement;

    // setup check all checkbox
    if (this.table.tableConfig.selectableRows) {
      const th: HTMLElement = this.renderer.createElement("th");
      // the actual check checkbox component
      const tableHeaderCheckbox: ComponentRef<TableRowCheckboxComponent<T>> = this.vcr.createComponent(
        TableRowCheckboxComponent<T>,
      );
      // set it to be the header checkbox and add it to the header row
      tableHeaderCheckbox.instance.mode = "header";
      this.renderer.appendChild(th, tableHeaderCheckbox.location.nativeElement);
      this.renderer.appendChild(headerRowElement, th);
      this.renderer.insertBefore(headerRowElement, th, headerRowElement.firstChild);

      // if there is a filter row, add a cell to it to keep the columns aligned
      const filterRow: HTMLElement = this.elRef.nativeElement.nextElementSibling;
      if (filterRow) {
        const filterCell: HTMLElement = this.renderer.createElement("th");
        this.renderer.appendChild(filterRow, filterCell);
        this.renderer.insertBefore(filterRow, filterCell, filterRow.firstChild);
      }
    }

    // set up expanded row column
    if (this.table.tableConfig.expandableRows) {
      // add a blank cell to the header row to keep the columns aligned
      const th: HTMLElement = this.renderer.createElement("th");
      this.renderer.appendChild(headerRowElement, th);
      this.renderer.insertBefore(headerRowElement, th, headerRowElement.firstChild);

      // if there is a filter row, add a cell to it to keep the columns aligned
      const filterRow: HTMLElement = this.elRef.nativeElement.nextElementSibling;
      if (filterRow) {
        const filterCell: HTMLElement = this.renderer.createElement("th");
        this.renderer.appendChild(filterRow, filterCell);
        this.renderer.insertBefore(filterRow, filterCell, filterRow.firstChild);
      }
    }
  }
}

/**
 * Directive that controls the row configuration of the table.
 * Dynamically adds the row selection checkbox and the expanding/collapse row icon columns if the table is configured to have them.
 *
 * @since 5.2.0
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: "tr[rowConfig]",
})
export class RowConfigDirective<T> implements OnInit {
  /**
   * The data for the row.
   *
   * @public
   * @type {TableData<T>}
   */
  @Input()
  public rowData: TableData<T>;

  public faCircleChevronRight: IconDefinition = faCircleChevronRight;
  public faCircleChevronDown: IconDefinition = faCircleChevronDown;

  public constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private table: TableComponent<T>,
    private vcr: ViewContainerRef,
  ) {}

  public ngOnInit(): void {
    const element: HTMLElement = this.elRef.nativeElement;
    // set up row selection checkbox
    if (this.table.tableConfig.selectableRows) {
      const td: HTMLElement = this.renderer.createElement("td");
      // the actual check checkbox component
      const tableHeaderCheckbox: ComponentRef<TableRowCheckboxComponent<T>> = this.vcr.createComponent(
        TableRowCheckboxComponent<T>,
      );
      // set it to be the body mode and add the row data to it.
      tableHeaderCheckbox.instance.mode = "body";
      tableHeaderCheckbox.instance.rowData = this.rowData;

      // add it to the table row.
      this.renderer.appendChild(td, tableHeaderCheckbox.location.nativeElement);
      this.renderer.appendChild(element, td);
      this.renderer.insertBefore(element, td, element.firstChild);
    }

    // set up the expand/collapse row icon
    if (this.table.tableConfig.expandableRows) {
      const td: HTMLElement = this.renderer.createElement("td");
      this.renderer.insertBefore(element, td, element.firstChild);

      this.expandIconUpdate();
    }
  }

  /**
   * Updates the expand/collapse icon based on the current state of the row.
   *
   */
  public expandIconUpdate(): void {
    const element: HTMLElement = this.elRef.nativeElement;
    // Remove existing icon if any
    const existingIcon: Element = element.querySelector("fa-icon");
    if (existingIcon) {
      this.renderer.removeChild(existingIcon.parentNode, existingIcon);
    }

    const existingTd: HTMLElement = element.querySelector("td");
    // Create an actual fa-icon component and add it to the row
    const faIcon: ComponentRef<FaIconComponent> = this.vcr.createComponent(FaIconComponent);
    faIcon.instance.icon = this.rowData.expanded ? this.faCircleChevronDown : this.faCircleChevronRight;
    faIcon.instance.size = "xl";
    this.renderer.appendChild(existingTd, faIcon.location.nativeElement);
    // add the click listener to the icon to expand/collapse the row
    this.renderer.listen(faIcon.location.nativeElement, "click", () => {
      this.rowData.expanded = !this.rowData.expanded;
      this.expandIconUpdate();
    });
    this.renderer.listen(faIcon.location.nativeElement, "keyup.enter", () => {
      this.rowData.expanded = !this.rowData.expanded;
      this.expandIconUpdate();
    });
    faIcon.location.nativeElement.tabIndex = 0;

    // force rerender of just this icon to show up
    faIcon.instance.render();
  }
}

/**
 * Directive that controls the sorting of any particular column on the table.
 * Place this directive on the header cell of the column you want to be sortable.
 *
 * @since 5.2.0
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: "th[sortable]",
})
export class SortableHeaderDirective<T> implements OnInit {
  /**
   * This is the property of the object that the column is associated with that you want to sort by.
   *
   * @public
   * @type {SortColumn<T>}
   */
  @Input()
  public sortableColumn: SortColumn<T> = "";

  /**
   * The current direction of the sort. Can be "asc", "desc", or "null".
   *
   * @public
   * @type {SortDirection}
   */
  @Input()
  public direction: SortDirection = "null";

  public faArrowUpShortWide: IconDefinition = faArrowUpShortWide;
  public faArrowDownShortWide: IconDefinition = faArrowDownShortWide;

  public constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private vcr: ViewContainerRef,
    private table: TableComponent<T>,
  ) {
    if (!this.table.tableConfig.groupRow) {
      const element: HTMLElement = this.elRef.nativeElement;
      element.style.cursor = "pointer";
    }
  }

  /**
   * Adds the "asc" class to the element if the direction is ascending.
   *
   * @public
   * @readonly
   * @type {boolean}
   */
  @HostBinding("class.asc")
  public get asc(): boolean {
    return this.direction === "asc";
  }

  /**
   * Adds the "desc" class to the element if the direction is descending.
   *
   * @public
   * @readonly
   * @type {boolean}
   */
  @HostBinding("class.desc")
  public get desc(): boolean {
    return this.direction === "desc";
  }

  /**
   * Adds a click listener to the element to rotate the sort direction and update the table.
   *
   * @public
   */
  @HostListener("click")
  public onClick(): void {
    if (!this.table.tableConfig.groupRow) {
      this.rotate();
    }
  }

  public ngOnInit(): void {
    if (!this.table.tableConfig.groupRow) {
      this.updateIcon();
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `This table was initialized with the Row Grouping feature. Sorting on ${String(
          this.sortableColumn,
        )} is disabled.`,
      );
    }
  }

  /**
   * Rotates the sort direction and updates the table.
   *
   * @public
   */
  public rotate(): void {
    this.direction = rotate[this.direction];
    this.table.onSort({ column: this.sortableColumn, direction: this.direction });
    this.updateIcon();
  }

  /**
   * Updates the icon based on the current sort direction.
   *
   * @public
   */
  public updateIcon(): void {
    const element: HTMLElement = this.elRef.nativeElement;
    // Remove existing icon if any
    const existingIcon: Element = document.querySelector("th.asc fa-icon, th.desc fa-icon");
    if (existingIcon) {
      this.renderer.removeChild(existingIcon.parentNode, existingIcon);
    }
    // Add icon if ascending or descending
    if (this.direction === "asc" || this.direction === "desc") {
      const faIcon: ComponentRef<FaIconComponent> = this.vcr.createComponent(FaIconComponent);
      faIcon.instance.icon = this.direction === "asc" ? this.faArrowUpShortWide : this.faArrowDownShortWide;
      this.renderer.appendChild(element, faIcon.location.nativeElement);
      // force rerender of just this icon to show up
      faIcon.instance.render();
    }
  }
}

/**
 * The table component is a generic table that can be used to display data in a tabular format.
 * It supports server-side pagination, sorting, and filtering as well as local data.
 * The table can be configured to have a fixed header, expandable rows, and selectable rows.
 *
 * @since 5.2.0
 */
@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
  providers: [TableService],
})
export class TableComponent<T> implements OnInit, AfterContentInit, OnDestroy {
  /**
   * Configurations for the table.
   *
   * @public
   * @type {AppTableConfig}
   */
  @Input()
  public tableConfig: AppTableConfig;
  /**
   * Emits an event when rows are selected with the selected rows.
   *
   * @public
   * @type {EventEmitter<TableData<T>[]>}
   */
  @Output()
  public rowsSelected: EventEmitter<TableData<T>[]> = new EventEmitter<[]>();
  /**
   * The templates that are found for the table.
   *
   * @public
   * @type {QueryList<AppTemplateDirective>}
   */
  @ContentChildren(AppTemplateDirective)
  public templates: QueryList<AppTemplateDirective>;
  /**
   * The sortable headers for the table
   *
   * @public
   * @type {QueryList<SortableHeaderDirective<T>>}
   */
  @ContentChildren(SortableHeaderDirective, { descendants: true })
  public headers: QueryList<SortableHeaderDirective<T>>;

  /**
   * The filters for the table
   *
   * @public
   * @type {QueryList<AppTableFilterComponent<T>>}
   */
  @ContentChildren(AppTableFilterComponent, { descendants: true })
  public filters: QueryList<AppTableFilterComponent<T>>;

  @ViewChild("mainTable")
  public mainTable: ElementRef;

  // Templates for the table. For expanded features, we can always add more templates to do more things.
  // The template that holds the header for the table
  public header: TemplateRef<any>;
  // The template that has the rows for the table
  public body: TemplateRef<any>;
  // The template that loads while the table is loading.
  public loadingBodyTemplate: TemplateRef<any>;
  // The template that allows for actions to be taken on the table.
  public tableActions: TemplateRef<any>;
  // The template that renders the group header
  public groupHeaderTemplate: TemplateRef<any>;

  // The selected rows for the table
  public selectedRows: TableData<T>[] = [];
  // The loading state of the table
  public loading: boolean;
  // The start index of the data (0-indexed)
  public start: number;
  // The end index of the data (0-indexed)
  public end: number;
  // The number of records showing after filtering
  public filteredCount: number;
  // The total number of records in the data before filtering and paginaation
  public totalDataRecodsLength: number;

  // The data for the table
  private _data: TableData<T>[];
  private destroy$: Subject<void> = new Subject<void>();

  public constructor(
    public pipe: DecimalPipe,
    public tableService: TableService<T>,
  ) {}

  public get data(): TableData<T>[] {
    return this._data;
  }
  public set data(val: TableData<T>[]) {
    if (this.tableConfig.expandableRows) {
      val = this.makeExpanded(val);
    }

    if (this.tableConfig.selectableRows) {
      val = this.makeSelectable(val);
    }

    this._data = val;
  }

  public ngOnInit(): void {
    this.tableService.tableName = this.tableConfig.tableName;
    this.tableService.url = this.tableConfig.url;
    this.tableService.serverSide = this.tableConfig.serverSide;
    this.tableService.stateSave = this.tableConfig.stateSave;
    this.tableService.groupRow = this.tableConfig.groupRow;
    this.tableService.sortColumn = this.tableConfig.groupRow as SortColumn<T>;
    this.tableService.sortDirection = this.tableConfig.groupRow ? "asc" : null;
    this.tableService.data$.pipe(takeUntil(this.destroy$)).subscribe((data: TableData<T>[]) => {
      this.data = data;
    });
    this.tableService.loading$.pipe(takeUntil(this.destroy$)).subscribe((tableLoading: boolean) => {
      this.loading = tableLoading;
    });
    this.tableService.tableStats$.pipe(takeUntil(this.destroy$)).subscribe((tableStats: TableStats) => {
      this.totalDataRecodsLength = tableStats.totalRecords;
      this.start = tableStats.start;
      this.end = tableStats.end;
      this.filteredCount = tableStats.filteredRecords;
    });
    this.tableService.selectedRows$.pipe(takeUntil(this.destroy$)).subscribe((rowsSelected: TableData<T>[]) => {
      this.rowsSelected.emit(rowsSelected);
    });
    this.tableService.fetchData();
  }

  public ngAfterContentInit(): void {
    // Set up all the templates for the table. Add more here if needed.
    (this.templates as QueryList<AppTemplateDirective>).forEach((item) => {
      switch (item.getType()) {
        case "header":
          this.header = item.template;
          break;

        case "body":
          this.body = item.template;
          break;

        case "loadingBodyTemplate":
          this.loadingBodyTemplate = item.template;
          break;

        case "tableActions":
          this.tableActions = item.template;
          break;

        case "groupHeaderTemplate":
          this.groupHeaderTemplate = item.template;
          break;
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Add the expanded property to the data defaulting to false.
   *
   * @public
   * @param data
   * @returns
   */
  public makeExpanded(data: T[]): TableData<T>[] {
    return data?.map((item) => ({ ...item, expanded: false }));
  }

  /**
   * Add the selected property to the data defaulting to false.
   *
   * @public
   * @param data
   * @returns
   */
  public makeSelectable(data: T[]): TableData<T>[] {
    return data?.map((item) => ({ ...item, selected: false }));
  }

  /**
   * Sets the sorting column and direction while resetting the other headers.
   *
   * @public
   * @param param0
   * @param param0.column
   * @param param0.direction
   */
  public onSort({ column, direction }: SortEvent<T>): void {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortableColumn !== column) {
        header.direction = "null";
      }
    });

    this.tableService.sortColumn = column;
    this.tableService.sortDirection = direction;
  }

  /**
   * Get all checked rows and send them to the service.
   *
   * @public
   */
  public checkIfAllChecked(): void {
    this.selectedRows = this.data.filter((item) => item.selected);
    this.tableService.onSelectedRowsChanged(this.selectedRows);
  }

  public clearFilters(): void {
    this.filters.forEach((filter) => {
      filter.removeFromSearch();
    });
  }

  public onPageChange(): void {
    this.mainTable.nativeElement.scrollTop = 0;
  }

  public shouldRenderRowGroupHeader(value: TableData<T>[], rowData: TableData<T>, i: number): boolean {
    const currentRowFieldData: any = this.resolveFieldData(rowData, this.tableConfig.groupRow);
    const prevRowData: TableData<T> = value[i - 1];
    if (prevRowData) {
      const previousRowFieldData: any = this.resolveFieldData(prevRowData, this.tableConfig.groupRow);

      return currentRowFieldData !== previousRowFieldData;
    }

    return true;
  }

  public resolveFieldData(data: any, field: any): any {
    if (data && field) {
      if (this.isFunction(field)) {
        return field(data);
      } else if (field.indexOf(".") === -1) {
        return data[field];
      }

      const fields: string[] = field.split(".");
      let value: any = data;
      for (let i: number = 0, len: number = fields.length; i < len; ++i) {
        if (value == null) {
          return null;
        }
        value = value[fields[i]];
      }

      return value;
    }

    return null;
  }

  public isFunction(obj: any): boolean {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  }
}
