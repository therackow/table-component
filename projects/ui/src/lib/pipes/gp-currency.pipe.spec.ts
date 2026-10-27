import { GpCurrencyPipe } from "./gp-currency.pipe";

describe("GpCurrencyPipe", () => {
  it("create an instance", () => {
    const pipe: GpCurrencyPipe = new GpCurrencyPipe("en-US");
    expect(pipe).toBeTruthy();
  });

  it("should add USD and go out to two decimals properly by default", () => {
    const pipe: GpCurrencyPipe = new GpCurrencyPipe("en-US");
    const result: string = pipe.transform("100");
    expect(result).toBe("100.00 USD");
  });

  it("should be able to customize the currency", () => {
    const pipe: GpCurrencyPipe = new GpCurrencyPipe("en-US");
    const result: string = pipe.transform("100", "EUR");
    expect(result).toBe("100.00 EUR");
  });

  it("should be able to customize the digit output", () => {
    const pipe: GpCurrencyPipe = new GpCurrencyPipe("en-US");
    const result: string = pipe.transform("100", "USD", "1.4-4");
    expect(result).toBe("100.0000 USD");
  });

  it("should handle negative numbers", () => {
    const pipe: GpCurrencyPipe = new GpCurrencyPipe("en-US");
    const result: string = pipe.transform("-100");
    expect(result).toBe("-100.00 USD");
  });

  it("should return 0.00 USD if the input is a string", () => {
    const pipe: GpCurrencyPipe = new GpCurrencyPipe("en-US");
    const result: string = pipe.transform("abc");
    expect(result).toBe("0.00 USD");
  });

  it("should return 0.00 USD if the input is number with too many decimals", () => {
    const pipe: GpCurrencyPipe = new GpCurrencyPipe("en-US");
    const result: string = pipe.transform("1.0.0..0.0.0.0.0.0.0.0");
    expect(result).toBe("0.00 USD");
  });

  it("should add commas where required", () => {
    const pipe: GpCurrencyPipe = new GpCurrencyPipe("en-US");
    const result: string = pipe.transform("1000000");
    expect(result).toBe("1,000,000.00 USD");
  });
});
