import { AfterViewInit, Component, Input, OnDestroy } from "@angular/core";

import { faSquare, faSquareCheck, IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { TableData, TableStats } from "../table-types";
import { TableComponent } from "../table.component";
import { TableService } from "../table.service";

/**
 * A checkbox component for the table component (app-table).
 *
 * @since 5.2.0
 */
@Component({
  selector: "app-table-row-checkbox",
  templateUrl: "./table-row-checkbox.component.html",
  styleUrls: ["./table-row-checkbox.component.scss"],
})
export class TableRowCheckboxComponent<T> implements AfterViewInit, OnDestroy {
  /**
   * The mode of the checkbox. Can be either "header" or "body".
   *
   * @public
   * @type {("header" | "body")}
   */
  @Input()
  public mode: "header" | "body";

  /**
   * The data on the row that the checkbox is associated with. Used for the "body" mode.
   *
   * @public
   * @type {TableData<T>}
   */
  @Input()
  public rowData: TableData<T>;

  // Value for the checkbox.
  public value: boolean = false;
  // Icons for the checkbox.
  public faSquareCheck: IconDefinition = faSquareCheck;
  public faSquare: IconDefinition = faSquare;

  private tableState: TableStats;
  private destroy$: Subject<void> = new Subject<void>();

  public constructor(
    private table: TableComponent<T>,
    private tableService: TableService<T>,
  ) {
    this.tableService.tableStats$.pipe(takeUntil(this.destroy$)).subscribe((tableState: TableStats) => {
      this.tableState = tableState;
    });
  }

  public ngAfterViewInit(): void {
    if (this.tableState) {
      if (this.mode === "header") {
        this.tableService.selectedRows$.pipe(takeUntil(this.destroy$)).subscribe((selectedRows: TableData<T>[]) => {
          this.value = selectedRows.length === this.tableState.end - (this.tableState.start - 1);
        });
      }

      if (this.mode === "body") {
        this.tableService.selectAll$.pipe(takeUntil(this.destroy$)).subscribe((value: boolean) => {
          this.value = value;
        });
      }
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onClick(): void {
    this.value = !this.value;

    if (this.mode === "header") {
      this.tableService.onSelectAllChanged(this.value);
      this.table.data.forEach((row) => (row.selected = this.value));
      this.table.checkIfAllChecked();
    }

    if (this.mode === "body") {
      this.table.data.filter((row) => row === this.rowData)[0].selected = this.value;
      this.table.checkIfAllChecked();
    }
  }
}
