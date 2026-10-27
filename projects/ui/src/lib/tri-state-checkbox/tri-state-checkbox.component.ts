import { Component, EventEmitter, Output } from "@angular/core";

import { faSquare, faSquareCheck, IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";

/**
 * A checkbox component that can be in three states: null, true, false.
 *
 * @since 5.2.0
 */
@Component({
  selector: "app-tri-state-checkbox",
  templateUrl: "./tri-state-checkbox.component.html",
  styleUrls: ["./tri-state-checkbox.component.scss"],
})
export class TriStateCheckboxComponent {
  /**
   * Emits an event when the checkbox is updated with the new value.
   *
   * @public
   * @type {EventEmitter<boolean>}
   */
  @Output()
  public checkboxUpdated: EventEmitter<any> = new EventEmitter<any>();

  public value: boolean | null = null;
  public faSquareCheck = faSquareCheck;
  public faSquareXmark = faSquareXmark;
  public faSquare = faSquare;

  /**
   * go between three states of the checkbox: null, true, false
   *
   * @public
   */
  public onClick(): void {
    if (this.value === null) {
      this.value = true;
    } else if (this.value) {
      this.value = false;
    } else {
      this.value = null;
    }

    this.checkboxUpdated.emit(this.value);
  }
}
