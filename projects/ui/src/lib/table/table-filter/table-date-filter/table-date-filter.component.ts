import { Component, EventEmitter, OnChanges, Output, SimpleChange, SimpleChanges, ViewChild } from "@angular/core";

import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

import { DatepickerComponent } from "../../../datepicker/datepicker.component";
import { AppDatePipe } from "../../../pipes/app-date.pipe";
import { padZero } from "../../../shared/utils";

/**
 * Description placeholder
 *
 * @since 5.2.0
 */
export interface DateFilter {
  dateOne: string | null;
  dateTwo: string | null;
  dateType: string;
}

/**
 * Filter to be used for date filtering on the Table (AppTableComponent).
 * Can be used to filter by a single date or a range of two dates.
 *
 * @since 5.2.0
 */
@Component({
  selector: "app-date-filter",
  templateUrl: "./table-date-filter.component.html",
  styleUrls: ["./table-date-filter.component.scss"],
  providers: [AppDatePipe],
})
export class DateFilterComponent implements OnChanges {
  /**
   * Event emitter for when a date is picked.
   *
   * @public
   * @type {EventEmitter<any>}
   */
  @Output()
  public datePicked: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Datepicker component for the first date.
   *
   * @public
   * @type {DatepickerComponent}
   */
  @ViewChild("datePickerOne", { static: true })
  public datePickerOne!: DatepickerComponent;

  /**
   * Datepicker component for the second date.
   *
   * @public
   * @type {DatepickerComponent}
   */
  @ViewChild("datePickerTwo", { static: true })
  public datePickerTwo!: DatepickerComponent;
  // The type of date filter to use. Can be "on", "before", "after", or "between".
  public dateType: string = "on";
  // Preloaded date for the first datepicker.
  public preloadedDateOne!: string;
  // Preloaded date for the second datepicker.
  public preloadedDateTwo!: string;
  // Object to hold the date filter values.
  public dateFilterObject: DateFilter = {
    dateOne: null,
    dateTwo: null,
    dateType: "on",
  };
  // Flag to clear the datepickers.
  public clear: boolean = false;

  public constructor() {}

  public ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      if (this.preloadedDateOne) {
        this.datePickerOne.ngOnChanges({
          preLoadedDate: new SimpleChange(undefined, this.preloadedDateOne, true),
        });
      }
    }, 0);
  }

  /**
   * Setup the date filter object and emit it.
   *
   * @param date
   * @param whichPicker
   */
  public dateSelected(date: { date: NgbDateStruct }, whichPicker: number): void {
    this.dateFilterObject.dateType = this.dateType;
    if (whichPicker === 1) {
      this.dateFilterObject.dateOne = date.date
        ? `${date.date.year}-${padZero(date.date.month)}-${padZero(date.date.day)}`
        : null;
    } else {
      this.dateFilterObject.dateTwo = date.date
        ? `${date.date.year}-${padZero(date.date.month)}-${padZero(date.date.day)}`
        : null;
    }

    this.emit();
  }

  /**
   * Reset the date filter object and clear the filters when the date type changes.
   */
  public dateSelectTypeChange(): void {
    this.dateFilterObject.dateType = this.dateType;
    this.dateFilterObject.dateOne = null;
    this.dateFilterObject.dateTwo = null;
    this.clear = true;
    setTimeout(() => {
      this.clear = false;
    }, 0);
    this.emit();
  }

  /**
   * Emit the date filter object.
   */
  public emit(): void {
    if (this.dateFilterObject.dateTwo === null && this.dateFilterObject.dateOne === null) {
      this.datePicked.emit(null);
    } else {
      this.datePicked.emit(this.dateFilterObject);
    }
  }
}
