import { Pipe, PipeTransform } from "@angular/core";

import { isValidIsoDate, makeAppDate } from "../shared/utils";

/**
 * A pipe to transform a given date to our App format.
 *
 * Our app format: DD-MMM-YYYY
 * EX: 03-JAN-2022
 */
@Pipe({
  name: "appDatePipe",
})
export class AppDatePipe implements PipeTransform {
  /**
   * Take the input and try to coerce it to a JS Date before passing it to the formatting function.
   *
   * Can take the following and return the corresponding App Date format:
   * JavaScript Date format
   * ISO Standard strings ex: '2022-10-31'
   * Epoch numbers AKA milliseconds since January 1st 1970. ex: 1609459200000
   *
   * @param value item to turn into a App date.
   * @param locale what language will the date be displayed in.
   */
  public transform(value: any, locale: string = "en", useUTC: boolean = true): any {
    if (value instanceof Date) {
      return makeAppDate(value, locale, useUTC);
    }

    if (!value) {
      return "--";
    }

    let date: Date = null;

    date = isValidIsoDate(value);
    if (date) {
      return makeAppDate(date, locale, useUTC);
    } else if (!isNaN(value)) {
      date = new Date(value);
      if (date.toString() !== "Invalid Date") {
        return makeAppDate(date, locale, useUTC);
      }
    }

    return "Invalid Date";
  }
}
