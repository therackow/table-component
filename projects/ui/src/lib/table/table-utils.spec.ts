import { TableData } from "./table-types";
import { rotate, compare, sort } from "./table-utils";

describe("Table Utils", () => {
  describe("rotate", () => {
    it("should rotate asc to desc", () => {
      expect(rotate["asc"]).toBe("desc");
    });

    it("should rotate desc to null", () => {
      expect(rotate["desc"]).toBe("null");
    });

    it("should rotate null to asc", () => {
      expect(rotate["null"]).toBe("asc");
    });
  });

  describe("compare", () => {
    it("should return -1 if first value is less than second", () => {
      expect(compare(1, 2)).toBe(-1);
    });

    it("should return 1 if first value is greater than second", () => {
      expect(compare(2, 1)).toBe(1);
    });

    it("should return 0 if both values are equal", () => {
      expect(compare(1, 1)).toBe(0);
    });
  });

  describe("sort", () => {
    interface TestData {
      id: number;
      name: string;
    }

    const data: TableData<TestData>[] = [
      { id: 3, name: "Charlie" },
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];

    it("should return the same data if direction is null", () => {
      expect(sort(data, "id", "null")).toEqual(data);
    });

    it("should return the same data if column is empty", () => {
      expect(sort(data, "", "asc")).toEqual(data);
    });

    it("should sort data in ascending order by id", () => {
      const sortedData: TableData<TestData>[] = sort(data, "id", "asc");
      expect(sortedData[0].id).toBe(1);
      expect(sortedData[1].id).toBe(2);
      expect(sortedData[2].id).toBe(3);
    });

    it("should sort data in descending order by id", () => {
      const sortedData: TableData<TestData>[] = sort(data, "id", "desc");
      expect(sortedData[0].id).toBe(3);
      expect(sortedData[1].id).toBe(2);
      expect(sortedData[2].id).toBe(1);
    });

    it("should sort data in ascending order by name", () => {
      const sortedData: TableData<TestData>[] = sort(data, "name", "asc");
      expect(sortedData[0].name).toBe("Alice");
      expect(sortedData[1].name).toBe("Bob");
      expect(sortedData[2].name).toBe("Charlie");
    });

    it("should sort data in descending order by name", () => {
      const sortedData: TableData<TestData>[] = sort(data, "name", "desc");
      expect(sortedData[0].name).toBe("Charlie");
      expect(sortedData[1].name).toBe("Bob");
      expect(sortedData[2].name).toBe("Alice");
    });
  });
});
