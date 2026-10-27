// Angular imports
import { Pipe, PipeTransform } from "@angular/core";

import { padZero } from "../shared/utils";

/**
 * transforms numbers between 0 and 10 by adding a 0 in front.
 */
@Pipe({
  name: "padZero",
})
export class PadZeroPipe implements PipeTransform {
  /** Takes a value, checks for a number then adds a 0 to the front of the number if it is between 10 and 0
   *
   * @param value
   * @param [args]
   * @returns
   * @memberof PadZeroPipe
   */
  public transform(value: number | string, args?: any): string | number {
    return padZero(value);
  }
}
