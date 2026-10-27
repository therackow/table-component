import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from "@angular/core";

import { NgSelectComponent } from "@ng-select/ng-select";

import { TriStateCheckboxComponent } from "../../tri-state-checkbox/tri-state-checkbox.component";
import { ngSelectItems, SearchQuery, SearchTerms } from "../table-types";
import { TableService } from "../table.service";
import { DateFilter, DateFilterComponent } from "./table-date-filter/table-date-filter.component";

/**
 * An instance of a filter for the Table component (app-table).
 *
 * @since 5.2.0
 *
 */
@Component({
  selector: "app-table-filter",
  templateUrl: "./table-filter.component.html",
  styleUrls: ["./table-filter.component.scss"],
})
export class AppTableFilterComponent<T> implements AfterViewInit {
  /**
   * The actual type of the filter. Changes what kind of input is shown and what kind of validations there are.
   *
   * @public
   * @type {("text" | "number" | "date" | "select" | "multi-select" | "checkbox")}
   */
  @Input()
  public type: "text" | "number" | "date" | "select" | "multi-select" | "checkbox";

  /**
   * The column that the filter is associated with. Must match the property of the object being filtered.
   *
   * If: `data = [{name: "John"}, {name: "Jane"}]`
   *
   * Then: `<app-table-filter column="name"></app-table-filter>`
   *
   * @public
   * @type {string}
   */
  @Input()
  public column: string;

  /**
   * An array of items that can be selected in the filter. Only used for the "select" and "multi-select" types.
   *
   * @public
   * @type {(ngSelectItems[] | string[])}
   */
  @Input()
  public filterItems: ngSelectItems[] | string[];

  /**
   * The placeholder text for the filter input. Used for the "text", "number", "select", and "multi-select" types.
   *
   * @public
   * @type {string}
   */
  @Input()
  public placeholderText: string = "";

  /**
   * The selected item in the filter. Used for the "select" and "multi-select" types.
   *
   * @public
   * @type {(ngSelectItems | ngSelectItems[] | string)}
   */
  @Input()
  public selectedItem: ngSelectItems | ngSelectItems[] | string;

  @ViewChild("filter")
  public filterElementRef: ElementRef | DateFilterComponent | TriStateCheckboxComponent | NgSelectComponent;

  /**
   * The search query object that is used to filter the data.
   *
   * @private
   * @type {SearchQuery}
   */
  private searchQuery: SearchQuery;

  public constructor(
    private tableService: TableService<T>,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  public ngAfterViewInit(): void {
    this.tableService.filterStateRestore$.subscribe((terms: SearchTerms) => {
      if (terms[this.column]) {
        switch (this.type) {
          case "text":
          case "number":
            if (this.filterElementRef instanceof ElementRef) {
              this.filterElementRef.nativeElement.value = terms[this.column].filterValue as string;
            }
            break;
          case "date":
            if (this.filterElementRef instanceof DateFilterComponent) {
              this.filterElementRef.dateType = (terms[this.column].filterValue as DateFilter).dateType;
              this.filterElementRef.preloadedDateOne = (terms[this.column].filterValue as DateFilter).dateOne;
              this.filterElementRef.preloadedDateTwo = (terms[this.column].filterValue as DateFilter).dateTwo;
              this.filterElementRef.ngOnChanges({});
            }
            break;
          case "select":
            if (this.filterElementRef instanceof NgSelectComponent) {
              this.selectedItem = terms[this.column].filterValue as ngSelectItems | ngSelectItems[] | string;
            }
            break;
          case "multi-select":
            if (this.filterElementRef instanceof NgSelectComponent) {
              this.selectedItem = terms[this.column].filterValue as ngSelectItems | ngSelectItems[] | string;
            }
            break;
          case "checkbox":
            if (this.filterElementRef instanceof TriStateCheckboxComponent) {
              this.filterElementRef.value = terms[this.column].filterValue as boolean;
            }
            break;
        }
        this.changeDetectorRef.detectChanges();
      }
    });

    if (this.tableService.stateSave) {
      this.tableService.restoreState(this.column);
    }
  }

  /**
   * Create the search query object based on the type of filter and the associated element.
   * As types get more complex, the logic will need to be updated.
   *
   * @param event
   * @param associatedElement
   */
  public buildSearchQuery(event: any): void {
    switch (this.type) {
      case "text":
      case "number":
        if (this.filterElementRef instanceof ElementRef) {
          this.searchQuery = { column: this.column, value: this.filterElementRef.nativeElement.value, type: this.type };
        }
        break;
      case "date":
        if (this.filterElementRef instanceof DateFilterComponent) {
          this.searchQuery = { column: this.column, value: event, type: this.type };
        }
        break;

      case "select":
        if (this.filterElementRef instanceof NgSelectComponent) {
          this.searchQuery = { column: this.column, value: this.filterElementRef.selectedValues[0], type: this.type };
        }
        break;
      case "multi-select":
        if (this.filterElementRef instanceof NgSelectComponent) {
          this.searchQuery = {
            column: this.column,
            value: this.filterElementRef.selectedValues.map((item) => item),
            type: this.type,
          };
        }
        break;
      case "checkbox":
        if (this.filterElementRef instanceof TriStateCheckboxComponent) {
          this.searchQuery = { column: this.column, value: this.filterElementRef.value, type: this.type };
        }
        break;
    }

    this.emit();
  }

  /**
   * Remove the search query from the table service and clear the associated element.
   *
   * @public
   * @param associatedElement The element that the search query is associated with.
   */
  public removeFromSearch(): void {
    switch (this.type) {
      case "text":
      case "number":
        if (this.filterElementRef instanceof ElementRef) {
          this.filterElementRef.nativeElement.value = "";
          this.searchQuery = { column: this.column, value: null, type: this.type };
        }
        break;
      case "date":
        if (this.filterElementRef instanceof DateFilterComponent) {
          this.filterElementRef.clear = true;
          this.filterElementRef.dateType = "on";
          setTimeout(() => {
            if (this.filterElementRef instanceof DateFilterComponent) {
              this.filterElementRef.clear = false;
            }
          }, 0);
          this.searchQuery = { column: this.column, value: null, type: this.type };
        }
        break;
      case "select":
        if (this.filterElementRef instanceof NgSelectComponent) {
          this.filterElementRef.clearModel();
          this.searchQuery = { column: this.column, value: null, type: this.type };
        }
      case "multi-select":
        if (this.filterElementRef instanceof NgSelectComponent) {
          this.filterElementRef.clearModel();
          this.selectedItem = [];
          this.searchQuery = { column: this.column, value: null, type: this.type };
        }
      case "checkbox":
        if (this.filterElementRef instanceof TriStateCheckboxComponent) {
          this.filterElementRef.value = null;
          this.searchQuery = { column: this.column, value: null, type: this.type };
        }
    }

    this.emit();
  }

  /**
   * Send the search query to the table service to filter the data.
   *
   * @private
   */
  private emit(): void {
    this.tableService.onSearchTermsChanged(this.searchQuery);
  }
}
