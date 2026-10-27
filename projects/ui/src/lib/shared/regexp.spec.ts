import { AppDateStrRegExp, isoDateStrRegExp } from "./regexp";

describe("AppDateStrRegExp", () => {
  it("Can work with uppercase", () => {
    expect(AppDateStrRegExp.test("01-JAN-2022")).toBeTrue();
  });

  it("Can work with lowecase", () => {
    expect(AppDateStrRegExp.test("01-jan-2022")).toBeTrue();
  });

  it("Can use single digit day", () => {
    expect(AppDateStrRegExp.test("1-JAN-2022")).toBeTrue();
  });

  it("Can use double digit day", () => {
    expect(AppDateStrRegExp.test("01-JAN-2022")).toBeTrue();
  });

  it("Can use three letter month", () => {
    expect(AppDateStrRegExp.test("01-JAN-2022")).toBeTrue();
  });

  it("Can use two letter month", () => {
    expect(AppDateStrRegExp.test("01-JA-2022")).toBeTrue();
  });

  it("Can use four letter month", () => {
    expect(AppDateStrRegExp.test("01-JANU-2022")).toBeTrue();
  });

  it("Does not work with random strings", () => {
    expect(AppDateStrRegExp.test("Random")).toBeFalse();
  });

  it("Does not work with slashes", () => {
    expect(AppDateStrRegExp.test("01/JAN/2022")).toBeFalse();
  });

  it("Does not work with underscores", () => {
    expect(AppDateStrRegExp.test("01_JAN_2022")).toBeFalse();
  });

  it("Does not work with periods", () => {
    expect(AppDateStrRegExp.test("01.JAN.2022")).toBeFalse();
  });

  it("Does not work with iso date", () => {
    expect(AppDateStrRegExp.test("2022-01-01")).toBeFalse();
  });
});

describe("isoDateStrRegExp", () => {
  it("Can work with iso standard", () => {
    expect(isoDateStrRegExp.test("2022-01-01")).toBeTrue();
  });

  it("Does not work with single digits", () => {
    expect(isoDateStrRegExp.test("2022-1-1")).toBeFalse();
  });

  it("Does not work with two digit dates", () => {
    expect(isoDateStrRegExp.test("22-01-01")).toBeFalse();
  });
});