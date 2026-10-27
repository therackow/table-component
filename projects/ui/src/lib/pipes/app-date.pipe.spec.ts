import { AppDatePipe } from "./app-date.pipe";

describe("AppDatePipePipe", () => {
  it("create an instance", () => {
    const pipe: AppDatePipe = new AppDatePipe();
    expect(pipe).toBeTruthy();
  });

  it("should format a JS Date object", () => {
    const pipe: AppDatePipe = new AppDatePipe();
    const result: string = pipe.transform(new Date("2014-11-03"));
    expect(result).toBe("03-NOV-2014");
  });

  it("should format a string that can be a JS Date object", () => {
    const pipe: AppDatePipe = new AppDatePipe();
    const result: string = pipe.transform("2014-11-17");
    expect(result).toBe("17-NOV-2014");
  });

  it('should return a "--" if the date is an empty string', () => {
    const pipe: AppDatePipe = new AppDatePipe();
    const result: string = pipe.transform("");
    expect(result).toBe("--");
  });

  it('should return "Invalid Date" for any input that cannot be coerced into a JS Date object', () => {
    const pipe: AppDatePipe = new AppDatePipe();
    const result: string = pipe.transform("JIBBERISH");
    expect(result).toBe("Invalid Date");
  });

  it('should return "Invalid Date" for any input that passes the regex but isnt a real date', () => {
    const pipe: AppDatePipe = new AppDatePipe();
    const result: string = pipe.transform("2022-02-30");
    expect(result).toBe("Invalid Date");
  });

  it('should return "Invalid Date" for any input that could be parsed into a Date object but isnt ISO standard', () => {
    const pipe: AppDatePipe = new AppDatePipe();
    const result: string = pipe.transform("02-10-2022");
    expect(result).toBe("Invalid Date");
  });

  it('should return "Invalid Date" for any input that doesnt meet the alternative epoch time', () => {
    const pipe: AppDatePipe = new AppDatePipe();
    const result: string = pipe.transform(59189141789189515614789489189);
    expect(result).toBe("Invalid Date");
  });

  it("should return the correct date for any value that does meet the alternative epoch time", () => {
    const pipe: AppDatePipe = new AppDatePipe();
    const result: string = pipe.transform(1609459200000);
    expect(result).toBe("01-JAN-2021");
  });

  it("should return translated dates if supplied with an alternative language", () => {
    const pipe: AppDatePipe = new AppDatePipe();
    const result: string = pipe.transform("2014-11-03", "pl-pl");
    expect(result).toBe("03-LIS-2014");
  });

  it("should keep local date local when useUTC flag is disabled", () => {
    const pipe: AppDatePipe = new AppDatePipe();

    const localDate: Date = new Date(2020, 11, 31, 23, 0, 0);
    const localResult: string = pipe.transform(localDate, "en", false);
    expect(localResult).toBe("31-DEC-2020");
  });
});
