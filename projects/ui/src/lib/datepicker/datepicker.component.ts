import {
  Component,
  OnInit,
  Injectable,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  ViewChild,
} from "@angular/core";

import {
  NgbDatepickerI18n,
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbInputDatepicker,
  NgbDate,
} from "@ng-bootstrap/ng-bootstrap";

import { i18nMonths } from "../i18n-months";
import { AppDatePipe } from "../pipes/app-date.pipe";
import { AppDateStrRegExp } from "../shared/regexp";
import { toInteger, isNumber, padZero, isValidIsoDate } from "../shared/utils";

/**
 * The Translation service that will use out i18nMonths constant to return the correctly translated days and months.
 */
@Injectable()
export class AppDatepickerI18n extends NgbDatepickerI18n {
  /**
   * The locale we are translating in.
   */
  public locale: string;

  public constructor() {
    super();
  }

  /**
   * Returns the transated date in our format from the NgbDateStruct.
   *
   * @param date
   */
  public getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }

  public getMonthShortName(month: number): string {
    return i18nMonths[this.locale].shortMonths[month - 1];
  }
  public getMonthFullName(month: number): string {
    return i18nMonths[this.locale].longMonths[month - 1];
  }
  public getWeekdayLabel(weekday: number): string {
    return i18nMonths[this.locale].shortDays[weekday - 1];
  }
}

/**
 * Converts between our App date format (dd-mmm-yyyy) to the NgbDateStruct used by the underlying datepicker.
 */
@Injectable()
export class NgbDateAppParserFormatter extends NgbDateParserFormatter {
  /**
   * The locale we are translating in.
   */
  public locale: string;

  public constructor(private datePipe: AppDatePipe) {
    super();
  }
  /**
   * This will take the value in the display and return the date struct that NGB uses
   *
   * @param value
   * @returns
   * @memberof NgbDateAppParserFormatter
   */
  public parse(value: string): NgbDateStruct {
    if (value && AppDateStrRegExp.test(value)) {
      const dateParts: string[] = value.trim().split("-");
      if (dateParts.length === 3 && isNumber(dateParts[0]) && this.isMonth(dateParts[1]) && isNumber(dateParts[2])) {
        return { day: toInteger(dateParts[0]), month: this.monthToNumber(dateParts[1]), year: toInteger(dateParts[2]) };
      }

      return null;
    }

    return null;
  }

  /**
   * this takes the NGB struct date and turns it into an app date
   *
   * @param date
   * @returns
   * @memberof NgbDateAppParserFormatter
   */
  public format(date: NgbDateStruct): string {
    return date
      ? this.datePipe.transform(new Date(`${date.year}-${padZero(date.month)}-${padZero(date.day)}`), this.locale)
      : "";
  }

  public isMonth(month: string): boolean {
    const tempMonthArry: string[] = i18nMonths[this.locale].shortMonths.map((shortMonth: string) =>
      shortMonth.toLowerCase(),
    );
    if (tempMonthArry.indexOf(month.toLowerCase()) >= 0) {
      return true;
    }

    return false;
  }

  public monthToNumber(month: string): number {
    const tempMonthArry: string[] = i18nMonths[this.locale].shortMonths.map((shortMonth: string) =>
      shortMonth.toLowerCase(),
    );

    return tempMonthArry.indexOf(month.toLowerCase()) + 1;
  }
}

/**
 * Our extension of the NgbDatepicker.
 */
@Component({
  selector: "app-datepicker",
  templateUrl: "./datepicker.component.html",
  providers: [
    { provide: NgbDatepickerI18n, useClass: AppDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateAppParserFormatter },
  ],
})
export class DatepickerComponent implements OnInit, OnChanges {
  /**
   * Allows for the programatic access of the datepicker
   *
   * @type {NgbInputDatepicker}
   * @memberof DatepickerComponent
   */
  @ViewChild("datePicker")
  public datePicker: NgbInputDatepicker;

  /**
   * Whether or not to clear the datepicker upon initialization or programatically.
   */
  @Input()
  public clear: boolean;

  /**
   * The language the datepicker should display in.
   */
  @Input()
  public locale: string = "en";

  /**
   * A date that should be preloaded into the datepicker upon initialization.
   */
  @Input()
  public preLoadedDate: string;

  /**
   * How this attaches to the DOM.
   *
   * @type {('' | 'body')}
   * @memberof DatepickerComponent
   */
  @Input()
  public container: "" | "body" = "";

  /**
   * The maximum date that can be selected in the datepicker.
   *
   * @type {NgbDateStruct}
   * @memberof DatepickerComponent
   * @since 2.1.0
   */
  @Input()
  public maxDate: NgbDateStruct;

  /**
   * The minimum date that can be selected in the datepicker.
   *
   * @type {NgbDateStruct}
   * @memberof DatepickerComponent
   * @since 3.3.0
   */
  @Input()
  public minDate: NgbDateStruct;

  /**
   * Whether or not the datepicker input is disabled.
   *
   * @type {boolean}
   * @memberof DatepickerComponent
   * @since 5.2.0
   */
  @Input()
  public disabled: boolean = false;

  /**
   * Event that emits when the date has changed in the datepicker.
   */
  @Output()
  public dateChanged: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Event that emits when the date input blurs.
   *
   * @type {EventEmitter<any>}
   * @memberof DatepickerComponent
   * @since 2.1.0
   */
  @Output()
  public dateBlur: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Date chosen in picker.
   */
  public date: any;

  public constructor(
    private parserFormatter: NgbDateParserFormatter,
    private i18nDatepicker: NgbDatepickerI18n,
  ) {}

  public ngOnInit(): void {
    (this.parserFormatter as NgbDateAppParserFormatter).locale = this.locale;
    (this.i18nDatepicker as AppDatepickerI18n).locale = this.locale;
  }

  public emit(): void {
    this.dateChanged.emit({ date: this.date });
  }

  public manualChange($event: Event): void {
    const value: string = $event.target["value"];
    this.date = this.parserFormatter.parse(value);
    this.dateChanged.emit({ date: this.date });
  }

  /**
   * For prefiltering, only add a date if the date exists and it is the first time (on page load)
   *
   * @param changes
   * @memberof DatepickerComponent
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.preLoadedDate && changes.preLoadedDate.currentValue && changes.preLoadedDate.firstChange) {
      let date: Date = null;

      if (isValidIsoDate(changes.preLoadedDate.currentValue)) {
        date = new Date(changes.preLoadedDate.currentValue);
      } else {
        const tempDate: NgbDateStruct = this.parserFormatter.parse(changes.preLoadedDate.currentValue);
        date = new Date(`${tempDate.year}-${padZero(tempDate.month)}-${padZero(tempDate.day)}`);
      }

      this.date = { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
      this.emit();
    }
    if (changes.clear && changes.clear.currentValue) {
      this.date = null;
    }
  }

  /**
   * Open the datepicker.
   */
  public open(): void {
    this.datePicker.open();
  }

  /**
   * Toggle the datepicker.
   */
  public toggle(): void {
    this.datePicker.toggle();
  }

  /**
   * Get the value of the date input and emit it on blur.
   *
   * @param $event
   */
  public blurInput($event: Event): void {
    const value: string = $event.target["value"];
    this.date = this.parserFormatter.parse(value);
    this.dateBlur.emit({ date: this.date });
  }
}
