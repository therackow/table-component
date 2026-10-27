import { PadZeroPipe } from "./pad-zero.pipe";

describe("PadZeroPipe", () => {
  it("create an instance", () => {
    const pipe: PadZeroPipe = new PadZeroPipe();
    expect(pipe).toBeTruthy();
  });

  it("pads a zero to a single digit number", () => {
    const pipe: PadZeroPipe = new PadZeroPipe();
    const result: string | number = pipe.transform(3);
    expect(result).toBe("03");
  });

  it("should not pad a zero if the number is over 10", () => {
    const pipe: PadZeroPipe = new PadZeroPipe();
    const result: string | number = pipe.transform(30);
    expect(result).toBe(30);
  });

  it("should return an error if you do not give a number", () => {
    const pipe: PadZeroPipe = new PadZeroPipe();
    const result: string | number = pipe.transform("jibberish");
    expect(result).toBe("jibberish is not a number!");
  });
});
