import {
  isNumber,
  isValidIsoDate,
  makeAppDate,
  padZero,
  toInteger,
} from "./utils";

describe("padZero", () => {
  it("Will pad a number less than 10", () => {
    const answer: string | number = padZero(5);
    expect(answer).toEqual("05");
  });

  it("Will not pad a number greater than 10", () => {
    const answer: string | number = padZero(15);
    expect(answer).toEqual(15);
  });

  it("Will take a string of a number and pad if less than 10", () => {
    const answer: string | number = padZero("5");
    expect(answer).toEqual("05");
  });

  it("Will take a string of a number and not pad if greater than 10", () => {
    const answer: string | number = padZero("15");
    expect(answer).toEqual(15);
  });

  it("Will not pad a negative number", () => {
    const answer: string | number = padZero("-5");
    expect(answer).toEqual(-5);
  });

  it("Will pad 0", () => {
    const answer: string | number = padZero(0);
    expect(answer).toEqual("00");
  });

  it("Will return error string if trying to pad something that isn't a number", () => {
    const answer: string | number = padZero("Potato");
    expect(answer).toEqual("Potato is not a number!");
  });
});

describe("isValidIsoDate", () => {
  it("Will return null for an invalid date", () => {
    const answer: Date = isValidIsoDate("10-JAN-2022");
    expect(answer).toBeNull();
  });

  it("Will return null for a date srting that includes time", () => {
    const answer: Date = isValidIsoDate("2022-01-03T14:48:00.000Z");
    expect(answer).toBeNull();
  });

  it("Will return null for a not real date", () => {
    const answer: Date = isValidIsoDate("2022-02-31");
    expect(answer).toBeNull();
  });

  it("Will return null if your date rolls over for a leap year", () => {
    const answer: Date = isValidIsoDate("2022-02-29");
    expect(answer).toBeNull();
  });

  it("Will return the Date object, at midnight local time, of a date specified", () => {
    const answer: Date = isValidIsoDate("2022-02-28");
    expect(answer).toEqual(new Date("2022-02-28"));
  });
});

describe("makeAppDate", () => {
  it("Will return date in English", () => {
    const dateVar: Date = new Date(2022, 1, 25);
    const answer: string = makeAppDate(dateVar, "en");
    expect(answer).toBe("25-FEB-2022");
  });

  it("Will return date in French", () => {
    const dateVar: Date = new Date(2022, 1, 25);
    const answer: string = makeAppDate(dateVar, "fr-fr");
    expect(answer).toBe("25-FÉV-2022");
  });
});

describe("toInteger", () => {
  it("Will return whole number", () => {
    const answer: number = toInteger(12);
    expect(answer).toBe(12);
  });

  it("Will return whole number from string", () => {
    const answer: number = toInteger("12");
    expect(answer).toBe(12);
  });

  it("Will return whole number rounded down", () => {
    const answer: number = toInteger(12.23);
    expect(answer).toBe(12);
  });

  it("Will return whole number rounded down from string", () => {
    const answer: number = toInteger("12.83");
    expect(answer).toBe(12);
  });

  it("Will return NaN if you didnt provice a number", () => {
    const answer: number = toInteger("Blue");
    expect(answer).toEqual(NaN);
  });
});

describe("isNumber", () => {
  it("Will return true if a number is supplied", () => {
    const answer: boolean = isNumber(12);
    expect(answer).toBeTrue();
  });

  it("Will return true if a string number is supplied", () => {
    const answer: boolean = isNumber("12");
    expect(answer).toBeTrue();
  });

  it("Will return false if a number is not supplied", () => {
    const answer: boolean = isNumber("Green");
    expect(answer).toBeFalse();
  });
});
