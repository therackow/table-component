import { CurrencyPipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";

/**
 * Our custom pipe to return App specific currency formatting.
 */
@Pipe({
  name: "appCurrency",
})
export class AppCurrencyPipe extends CurrencyPipe implements PipeTransform {
  /**
   * Transforms the value based on the original Angular Currency Pipe. From there it
   * turns it into our App format.
   *
   * Angular format USD1,500.00 | -USD1,5000.00
   * App format 1,500.00 USD | -1,500.00 USD
   *
   * @param value
   * @param [currencyCode]
   * @param [digits]
   * @returns
   * @memberof AppCurrencyPipe
   */
  public transform(value: any, currencyCode?: string, digits?: string): any {
    if (isNaN(value)) {
      value = 0;
    }
    const formattedByCurrencyPipe: string = super.transform(value, currencyCode, "code", digits, "en-US");
    const digitPlace: number = formattedByCurrencyPipe.search(/\d/);
    const currency: string = formattedByCurrencyPipe.slice(0, digitPlace); // get the currency which could be '-USD', '(USD', or 'USD'
    let formatedByMe: string;

    if (formattedByCurrencyPipe.charAt(0) === "-") {
      // if it starts with a '-'
      formatedByMe = "-" + formattedByCurrencyPipe.slice(digitPlace) + " " + currency.slice(1); // creates '-1,500.00 USD'
    } else {
      // if not a negative number
      formatedByMe = formattedByCurrencyPipe.slice(digitPlace) + " " + currency; // creates '1,500.00 USD'
    }

    return formatedByMe;
  }
}
