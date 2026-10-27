import { ComponentFixture } from "@angular/core/testing";

export const CONVERT_ZERO_TO_NULL: string = "convertZeroToNull";

/**
 * Simulate user typing into a given input via consecutive keyDown and Input events
 *
 * @param value  - string to simulate
 * @param inputEl - input to send events to
 * @param fixture - jasmine fixture to run this function on
 */
export function fakeTyping(value: string, inputEl: HTMLInputElement, fixture: ComponentFixture<any>): void {
  for (const char of value) {
    const eventMockKeyDown: KeyboardEvent = new KeyboardEvent("keydown", { key: char });

    // Dispatch out mock events
    inputEl.dispatchEvent(eventMockKeyDown);

    // If our key event was prevented, skip
    if (eventMockKeyDown.defaultPrevented) {
      // invalid char
    } else {
      inputEl.value = inputEl.value.concat(char);
      inputEl.dispatchEvent(new Event("input"));
    }
  }

  fixture.detectChanges();
}

/**
 * Locate the element by a css class and ensure the elements text content matches supplied value
 *
 * @param fixture - Jasmine fixture to run this function on
 * @param expectedValue - expected value of the input found via cssSelector
 * @param cssSelector - Css selector to find an input, if more than one is found will return the first
 */
export function checkElementValue(fixture: ComponentFixture<any>, cssSelector: string): string {
  return fixture.nativeElement.querySelector(cssSelector).textContent;
}

/**
 * Fetch a input element, available during editing
 *
 * @param fixture - Jasmine fixture to run this function on
 * @param cssSelector - Css selector to find an input, if more than one is found will return the first
 */
export function getInputElement(fixture: ComponentFixture<any>, cssSelector: string): HTMLInputElement {
  return fixture.nativeElement.querySelector(cssSelector);
}
