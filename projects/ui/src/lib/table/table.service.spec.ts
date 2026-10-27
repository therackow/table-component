import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { DateFilter } from "./table-filter/table-date-filter/table-date-filter.component";
import { TableData, TableDataObject, SearchQuery, State } from "./table-types";
import { TableService } from "./table.service";

describe("TableServiceService", () => {
  let service: TableService<any>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TableService],
    });
    service = TestBed.inject(TableService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should initialize everything", () => {
    expect(service.page).toBe(1);
    expect(service.pageSize).toBe(6);
    expect(service.sortColumn).toBe(undefined);
    expect(service.sortDirection).toBe(undefined);
    expect(service["tableState"].searchTerms).toEqual({});
  });

  it("should set and get page", () => {
    service.serverSide = true;
    service.url = "/api/data";
    service.page = 2;
    expect(service.page).toBe(2);
    const req: TestRequest = httpMock.expectOne(
      "/api/data?serverSide=true&page=2&pageSize=6&searchTerms=%7B%7D&sortColumn=&sortDirection=null",
    );
    expect(req.request.method).toBe("GET");
    req.flush({
      data: [{ id: 1, name: "Test" }],
      filtered_records: 1,
      total_records: 1,
      start: 0,
      end: 1,
    });
  });

  it("should set and get pageSize", () => {
    service.pageSize = 10;
    expect(service.pageSize).toBe(10);
  });

  it("should set sortColumn", () => {
    service.sortColumn = "name";
    expect(service["tableState"].sortColumn).toBe("name");
  });

  it("should set sortDirection", () => {
    service.sortDirection = "asc";
    expect(service["tableState"].sortDirection).toBe("asc");
  });

  it("should set data and trigger local search", () => {
    const data: TableDataObject<any> = {
      data: [{ id: 1, name: "Test" }],
      start: 0,
      end: 1,
      totalRecords: 1,
      filteredRecordsLength: 1,
    };
    service.serverSide = false;
    service.data$.subscribe((result) => {
      expect(result).toEqual(data.data);
    });
    service.setData(data);
  });

  it("should sort data locally", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test" },
        { id: 2, name: "Example" },
      ],
      start: 0,
      end: 2,
      totalRecords: 2,
      filteredRecordsLength: 2,
    };
    service.serverSide = false;
    service.sortColumn = "name";
    service.sortDirection = "asc";
    service.data$.subscribe((result) => {
      expect(result).toEqual([
        { id: 2, name: "Example" },
        { id: 1, name: "Test" },
      ]);
    });
    service.setData(data);
  });

  it("should filter data locally by text", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test" },
        { id: 2, name: "Example" },
      ],
      start: 0,
      end: 2,
      totalRecords: 2,
      filteredRecordsLength: 2,
    };
    service.serverSide = false;
    const searchTerms: SearchQuery = { column: "name", value: "Test", type: "text" };
    service.onSearchTermsChanged(searchTerms);
    service.data$.subscribe((result) => {
      expect(result).toEqual([{ id: 1, name: "Test" }]);
    });
    service.setData(data);
  });

  it("should filter data locally by number", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test", age: 20 },
        { id: 2, name: "Example", age: 30 },
      ],
      start: 0,
      end: 2,
      totalRecords: 2,
      filteredRecordsLength: 2,
    };
    service.serverSide = false;
    const searchTerms: SearchQuery = { column: "age", value: "20", type: "number" };
    service.onSearchTermsChanged(searchTerms);
    service.data$.subscribe((result) => {
      expect(result).toEqual([{ id: 1, name: "Test", age: 20 }]);
    });
    service.setData(data);
  });

  it("should filter data locally by on date", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test", date: "2021-01-01" },
        { id: 2, name: "Example", date: "2021-01-02" },
      ],
      start: 0,
      end: 2,
      totalRecords: 2,
      filteredRecordsLength: 2,
    };
    service.serverSide = false;
    const searchTerms: SearchQuery = {
      column: "date",
      value: { dateType: "on", dateOne: "2021-01-01" } as DateFilter,
      type: "date",
    };
    service.onSearchTermsChanged(searchTerms);
    service.data$.subscribe((result) => {
      expect(result).toEqual([{ id: 1, name: "Test", date: "2021-01-01" }]);
    });
    service.setData(data);
  });

  it("should filter data locally by between date", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test", date: "2021-01-01" },
        { id: 2, name: "Example", date: "2021-01-02" },
      ],
      start: 0,
      end: 2,
      totalRecords: 2,
      filteredRecordsLength: 2,
    };
    service.serverSide = false;
    const searchTerms: SearchQuery = {
      column: "date",
      value: { dateType: "between", dateOne: "2021-01-01", dateTwo: "2021-01-02" } as DateFilter,
      type: "date",
    };
    service.onSearchTermsChanged(searchTerms);
    service.data$.subscribe((result) => {
      expect(result).toEqual(data.data);
    });
    service.setData(data);
  });

  it("should filter data locally by before date", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test", date: "2021-01-01" },
        { id: 2, name: "Example", date: "2021-01-02" },
      ],
      start: 0,
      end: 2,
      totalRecords: 2,
      filteredRecordsLength: 2,
    };
    service.serverSide = false;
    const searchTerms: SearchQuery = {
      column: "date",
      value: { dateType: "before", dateOne: "2021-01-02" } as DateFilter,
      type: "date",
    };
    service.onSearchTermsChanged(searchTerms);
    service.data$.subscribe((result) => {
      expect(result).toEqual([{ id: 1, name: "Test", date: "2021-01-01" }]);
    });
    service.setData(data);
  });

  it("should filter data locally by after date", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test", date: "2021-01-01" },
        { id: 2, name: "Example", date: "2021-01-02" },
      ],
      start: 0,
      end: 2,
      totalRecords: 2,
      filteredRecordsLength: 2,
    };
    service.serverSide = false;
    const searchTerms: SearchQuery = {
      column: "date",
      value: { dateType: "after", dateOne: "2021-01-01" } as DateFilter,
      type: "date",
    };
    service.onSearchTermsChanged(searchTerms);
    service.data$.subscribe((result) => {
      expect(result).toEqual([{ id: 2, name: "Example", date: "2021-01-02" }]);
    });
    service.setData(data);
  });

  it("should filter data locally by select", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test", status: "active" },
        { id: 2, name: "Example", status: "inactive" },
      ],
      start: 0,
      end: 2,
      totalRecords: 2,
      filteredRecordsLength: 2,
    };
    service.serverSide = false;
    const searchTerms: SearchQuery = { column: "status", value: "active", type: "select" };
    service.onSearchTermsChanged(searchTerms);
    service.data$.subscribe((result) => {
      expect(result).toEqual([{ id: 1, name: "Test", status: "active" }]);
    });
    service.setData(data);
  });

  it("should filter data locally by multi-select", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test", status: ["active", "inactive"] },
        { id: 2, name: "Example", status: ["active"] },
        { id: 3, name: "Sample", status: ["inactive"] },
        { id: 4, name: "Another", status: ["pending"] },
      ],
      start: 0,
      end: 2,
      totalRecords: 2,
      filteredRecordsLength: 2,
    };
    service.serverSide = false;
    const searchTerms: SearchQuery = { column: "status", value: ["active", "pending"], type: "multi-select" };
    service.onSearchTermsChanged(searchTerms);
    service.data$.subscribe((result) => {
      expect(result).toEqual([
        { id: 1, name: "Test", status: ["active", "inactive"] },
        { id: 2, name: "Example", status: ["active"] },
        { id: 4, name: "Another", status: ["pending"] },
      ]);
    });
    service.setData(data);
  });

  it("should filter data locally by checkbox", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test", status: true },
        { id: 2, name: "Example", status: false },
      ],
      start: 0,
      end: 2,
      totalRecords: 2,
      filteredRecordsLength: 2,
    };
    service.serverSide = false;
    const searchTerms: SearchQuery = { column: "status", value: true, type: "checkbox" };
    service.onSearchTermsChanged(searchTerms);
    service.data$.subscribe((result) => {
      expect(result).toEqual([{ id: 1, name: "Test", status: true }]);
    });
    service.setData(data);
  });

  it("should paginate data locally", () => {
    const data: TableDataObject<any> = {
      data: [
        { id: 1, name: "Test" },
        { id: 2, name: "Example" },
        { id: 3, name: "Sample" },
      ],
      start: 0,
      end: 3,
      totalRecords: 3,
      filteredRecordsLength: 3,
    };
    service.serverSide = false;
    service.pageSize = 2;
    service.page = 2;
    service.data$.subscribe((result) => {
      expect(result).toEqual([{ id: 3, name: "Sample" }]);
    });
    service.setData(data);
  });

  it("should handle selected rows change with data", () => {
    const selectedRows: TableData<any>[] = [{ id: 1, name: "Test" }];
    service.selectedRows$.subscribe((result) => {
      expect(result).toEqual(selectedRows);
    });
    service.onSelectedRowsChanged(selectedRows);
    service.anyRowsSelected$.subscribe((result) => {
      expect(result).toBe(true);
    });
  });

  it("should handle selected rows change without data", () => {
    const selectedRows: TableData<any>[] = [];
    service.onSelectedRowsChanged(selectedRows);
    service.selectedRows$.subscribe((result) => {
      expect(result).toEqual(selectedRows);
    });
    service.anyRowsSelected$.subscribe((result) => {
      expect(result).toBe(false);
    });
  });

  it("should handle select all change", () => {
    service.onSelectAllChanged(true);
    service.selectAll$.subscribe((result) => {
      expect(result).toBe(true);
    });
    service.anyRowsSelected$.subscribe((result) => {
      expect(result).toBe(true);
    });
  });

  it("should handle loading state change", () => {
    service.onLoading(true);
    service.loading$.subscribe((result) => {
      expect(result).toBe(true);
    });
  });

  it("should handle search terms change", () => {
    const searchTerms: SearchQuery = { column: "name", value: "Test", type: "text" };
    service.onSearchTermsChanged(searchTerms);
    expect(service["tableState"].searchTerms["name"]).toEqual({
      filterValue: "Test",
      filterType: "text",
    });
  });

  it("should only call fetchData() once when search terms change multiple times in a row", (done: DoneFn) => {
    const searchTerms: SearchQuery = { column: "name", value: "Test", type: "text" };
    service.url = "/api/data";
    service.serverSide = true;
    service.onSearchTermsChanged(searchTerms);
    service.onSearchTermsChanged(searchTerms);
    service.onSearchTermsChanged(searchTerms);
    service.onSearchTermsChanged(searchTerms);
    setTimeout(() => {
      const req: TestRequest = httpMock.expectOne(
        "/api/data?serverSide=true&page=1&pageSize=6&searchTerms=%7B%22name%22:%7B%22filterValue%22:%22Test%22,%22filterType%22:%22text%22%7D%7D&sortColumn=&sortDirection=null",
      );
      expect(req.request.method).toBe("GET");
      service.data$.subscribe((result) => {
        expect(result).toEqual([{ id: 1, name: "Test" }]);
      });
      req.flush({
        data: [{ id: 1, name: "Test" }],
        filtered_records: 1,
        total_records: 1,
        start: 0,
        end: 1,
      });
      done();
    }, 400);
  });

  it("should only run local search once when search terms change multiple times in a row", (done: DoneFn) => {
    const searchTerms: SearchQuery = { column: "name", value: "Test", type: "text" };
    service.serverSide = false;
    service.onSearchTermsChanged(searchTerms);
    service.onSearchTermsChanged(searchTerms);
    service.onSearchTermsChanged(searchTerms);
    service.onSearchTermsChanged(searchTerms);
    setTimeout(() => {
      service.data$.subscribe((result) => {
        expect(result).toEqual([{ id: 1, name: "Test" }]);
        done();
      });
      service.setData({
        data: [{ id: 1, name: "Test" }],
        start: 0,
        end: 1,
        totalRecords: 1,
        filteredRecordsLength: 1,
      });
    }, 400);
  });

  it("should handle passing a null value of a filter to search terms change", () => {
    const searchTerms: SearchQuery = { column: "name", value: null, type: "text" };
    service.onSearchTermsChanged(searchTerms);
    expect(service["tableState"].searchTerms["name"]).toBeUndefined();
  });

  it("should fetch data from server", () => {
    service.url = "/api/data";
    service.serverSide = true;
    service.fetchData();
    const req: TestRequest = httpMock.expectOne(
      "/api/data?serverSide=true&page=1&pageSize=6&searchTerms=%7B%7D&sortColumn=&sortDirection=null",
    );
    expect(req.request.method).toBe("GET");
    service.data$.subscribe((result) => {
      expect(result).toEqual([{ id: 1, name: "Test" }]);
    });
    req.flush({
      data: [{ id: 1, name: "Test" }],
      filtered_records: 1,
      total_records: 1,
      start: 0,
      end: 1,
    });
  });

  it("should save and restore state", () => {
    const state: State<any> = {
      page: 1,
      pageSize: 10,
      searchTerms: { name: { filterValue: "Test", filterType: "text" } },
      sortColumn: "name",
      sortDirection: "asc",
    };
    service.tableName = "testTable";
    service.saveState("testTable");
    sessionStorage.setItem("testTable", JSON.stringify(state));
    service.restoreState("name");
    expect(service["tableState"]).toEqual(state);
  });

  it("should call fetchData/local search once no matter how many times restoreState is called", (done: DoneFn) => {
    const state: State<any> = {
      page: 1,
      pageSize: 10,
      searchTerms: { name: { filterValue: "Test", filterType: "text" } },
      sortColumn: "name",
      sortDirection: "asc",
    };
    service.tableName = "testTable";
    service.saveState("testTable");
    sessionStorage.setItem("testTable", JSON.stringify(state));
    service.restoreState("name");
    service.restoreState("name");
    service.restoreState("name");
    service.restoreState("name");
    service.url = "/api/data";
    service.serverSide = true;
    setTimeout(() => {
      const req: TestRequest = httpMock.expectOne(
        "/api/data?serverSide=true&page=1&pageSize=10&searchTerms=%7B%22name%22:%7B%22filterValue%22:%22Test%22,%22filterType%22:%22text%22%7D%7D&sortColumn=name&sortDirection=asc",
      );
      expect(req.request.method).toBe("GET");
      service.data$.subscribe((result) => {
        expect(result).toEqual([{ id: 1, name: "Test" }]);
      });
      req.flush({
        data: [{ id: 1, name: "Test" }],
        filtered_records: 1,
        total_records: 1,
        start: 0,
        end: 1,
      });
      done();
    }, 400);
  });

  it("should clear state", () => {
    const state: State<any> = {
      page: 1,
      pageSize: 10,
      searchTerms: { name: { filterValue: "Test", filterType: "text" } },
      sortColumn: "name",
      sortDirection: "asc",
    };
    sessionStorage.setItem("testTable", JSON.stringify(state));
    service.clearState("testTable");
    expect(sessionStorage.getItem("testTable")).toBeNull();
  });
});
