import { DecimalPipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, DebugElement, Renderer2, TemplateRef, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { Subject, BehaviorSubject, Observable, of } from "rxjs";
import { DatepickerComponent } from "../datepicker/datepicker.component";
import { GpCurrencyPipe } from "../pipes/gp-currency.pipe";
import { GpDatePipe } from "../pipes/gp-date.pipe";

import { TriStateCheckboxComponent } from "../tri-state-checkbox/tri-state-checkbox.component";
import { DateFilterComponent } from "./table-filter/table-date-filter/table-date-filter.component";
import { AppTableFilterComponent } from "./table-filter/table-filter.component";
import { TableRowCheckboxComponent } from "./table-row-checkbox/table-row-checkbox.component";
import { TableData, TableStats, AppTableConfig, SortEvent } from "./table-types";
import {
  TableComponent,
  HeaderConfigDirective,
  RowConfigDirective,
  SortableHeaderDirective,
  AppTemplateDirective,
} from "./table.component";
import { TableService } from "./table.service";

@Component({
  template: `
    <app-table [tableConfig]="config" (rowsSelected)="onRowsSelected($event)">
      <ng-template appTemplate name="header">
        <tr headerConfig>
          <th scope="col">#</th>
          <th scope="col" sortable sortableColumn="name" class="country-header">Country</th>
          <th scope="col" sortable sortableColumn="area">Area</th>
          <th scope="col" sortable sortableColumn="population">Population</th>
          <th scope="col" sortable sortableColumn="g7">In G7</th>
          <th scope="col" sortable sortableColumn="established">Established On</th>
          <th scope="col">Languages</th>
          <th scope="col" sortable sortableColumn="gdpPerCapitaUSD">GDP per capita in USD</th>
        </tr>
        <tr class="column-filter-headers">
          <th scope="col">
            <!-- Intentionally blank -->
          </th>
          <th scope="col">
            <app-table-filter
              [type]="'select'"
              [column]="'name'"
              [filterItems]="countryChoices$ | async"
              placeholderText="Select country"
            ></app-table-filter>
          </th>
          <th scope="col">
            <!-- Intentionally blank -->
          </th>
          <th scope="col">
            <!-- Intentionally blank -->
          </th>
          <th scope="col">
            <!-- Intentionally blank -->
          </th>
          <th scope="col">
            <!-- Intentionally blank -->
          </th>
          <th scope="col">
            <!-- Intentionally blank -->
          </th>
          <th scope="col">
            <!-- Intentionally blank -->
          </th>
        </tr>
      </ng-template>

      <ng-template appTemplate name="groupHeaderTemplate" let-country>
        <tr class="group-header">
          <td colspan="10">
            <span class="fw-bold">{{ country.continent }}</span>
          </td>
        </tr>
      </ng-template>

      <ng-template appTemplate name="body" let-country>
        <tr class="main-row" rowConfig [rowData]="country">
          <td scope="row">{{ country.id }}</td>
          <td>{{ country.name }}</td>
          <td>{{ country.area | number }}</td>
          <td>{{ country.population | number }}</td>
          <td>{{ country.g7 }}</td>
          <td>{{ country.established | gpDatePipe }}</td>
          <td>
            <ul>
              <li *ngFor="let language of country.languages">{{ language }}</li>
            </ul>
          </td>
          <td>{{ country.gdpPerCapitaUSD | gpCurrency: "USD" : "1.2-2" }}</td>
        </tr>
        <tr class="expanded-row" *ngIf="country.expanded">
          <td style="background-color: aqua; border-bottom: 1px solid gray" colspan="10">{{ country | json }}</td>
        </tr>
      </ng-template>

      <ng-template appTemplate name="tableActions">
        <div class="btn btn-group">
          <button class="btn btn-large btn-filled btn-main" [disabled]="rowsSelected === false">Approve</button>
          <button class="btn btn-large btn-outline btn-main" [disabled]="rowsSelected === false">Decline</button>
        </div>
      </ng-template>

      <ng-template appTemplate name="loadingBodyTemplate">
        <p>loading!</p>
      </ng-template>
    </app-table>
  `,
})
class TestHostComponent {
  public config: AppTableConfig = {
    serverSide: false,
    url: "http://localhost:5000/data",
    expandableRows: true,
    selectableRows: true,
    tableName: "countries",
    stateSave: false,
    tableCaption: "Test caption",
    tableSummary: "Test summary",
  };

  public rowsSelected: boolean = false;
  public countryChoices$: Observable<string[]>;
  public languageChoices$: Observable<string[]>;

  public onRowsSelected(rows: TableData<any>[]): void {
    this.rowsSelected = rows.some((row) => row.selected);
  }
}

describe("TableComponent", () => {
  const countries: any[] = require("./test-data/countries.json");
  let tableComponent: TableComponent<any>;
  // let fixture: ComponentFixture<TableComponent<any>>;
  let testHostComponent: TestHostComponent;
  let testHostFixture: ComponentFixture<TestHostComponent>;
  // let tableServiceSpy: TableServiceService<any>;
  let httpClientSpyObj: jasmine.SpyObj<HttpClient>;
  // let tableServiceSpyObj: jasmine.SpyObj<TableServiceService<any>>;
  let tableServiceSpy: jasmine.SpyObj<TableService<any>>;

  const dataSource: Subject<any[]> = new Subject<any[]>();
  const loadingSource: Subject<boolean> = new Subject<boolean>();
  const tableStatsSource: Subject<TableStats> = new Subject<TableStats>();
  const selectedRowsSource: Subject<TableData<any>[]> = new Subject<TableData<any>[]>();

  beforeEach(async () => {
    tableServiceSpy = jasmine.createSpyObj("TableServiceService", ["fetchData", "onSelectedRowsChanged"]);

    tableServiceSpy.tableStats$ = new BehaviorSubject<TableStats>({
      start: 0,
      end: 10,
      totalRecords: 100,
      filteredRecords: 50,
    }).asObservable();

    tableServiceSpy.selectedRows$ = new Subject<TableData<any>[]>().asObservable();
    tableServiceSpy.selectAll$ = new Subject<boolean>().asObservable();
    tableServiceSpy.loading$ = new BehaviorSubject<boolean>(false).asObservable();
    tableServiceSpy.filteredTable$ = new BehaviorSubject<boolean>(false).asObservable();
    tableServiceSpy.anyRowsSelected$ = new BehaviorSubject<boolean>(false).asObservable();

    httpClientSpyObj = jasmine.createSpyObj("HttpClient", ["get"]);

    httpClientSpyObj.get.and.callFake((url: string) => {
      if (url.includes("getFilterData")) {
        const urlParams: URLSearchParams = new URLSearchParams(url.split("?")[1]);
        const nameParam: string = urlParams.get("name");

        const filterArray: string[] = countries.map((country: any) => country[nameParam]);

        return of(filterArray as any);
      }

      return of(countries as any);
    });

    await TestBed.configureTestingModule({
      imports: [NgbModule, FontAwesomeModule, NgSelectModule, FormsModule],
      declarations: [
        TableComponent,
        HeaderConfigDirective,
        RowConfigDirective,
        SortableHeaderDirective,
        AppTemplateDirective,
        AppTableFilterComponent,
        TableRowCheckboxComponent,
        TestHostComponent,
        TriStateCheckboxComponent,
        DateFilterComponent,
        DatepickerComponent,
        GpDatePipe,
        GpCurrencyPipe,
      ],
      providers: [
        DecimalPipe,
        { provide: TableService, useValue: tableServiceSpy },
        { provide: HttpClient, useValue: httpClientSpyObj },
        Renderer2,
      ],
    }).compileComponents();

    tableServiceSpy = TestBed.inject(TableService) as jasmine.SpyObj<TableService<any>>;
  });

  function configureTestComponent(config: Partial<AppTableConfig>): void {
    configureServiceSpy(config);
    testHostFixture = TestBed.createComponent(TestHostComponent);
    testHostComponent = testHostFixture.componentInstance;
    tableComponent = testHostFixture.debugElement.query(By.directive(TableComponent)).componentInstance;
    tableComponent.tableService = tableServiceSpy;
    // defaults
    testHostComponent.config = {
      serverSide: false,
      url: "http://localhost:5000/data",
      expandableRows: false,
      selectableRows: false,
      tableName: "countries",
      stateSave: false,
      tableCaption: "Test caption",
      tableSummary: "Test summary",
    };
    // override defaults with passed in config
    testHostComponent.config = { ...testHostComponent.config, ...config };
    testHostFixture.detectChanges();
  }

  function configureServiceSpy(config: Partial<AppTableConfig>): void {
    tableServiceSpy.tableName = config.tableName || "countries";
    tableServiceSpy.serverSide = config.serverSide || false;
    tableServiceSpy.stateSave = config.stateSave || false;
    tableServiceSpy.url = config.url || "http://localhost:5000/data";
    tableServiceSpy.data$ = dataSource.asObservable();
    tableServiceSpy.loading$ = loadingSource.asObservable();
    tableServiceSpy.tableStats$ = tableStatsSource.asObservable();
    tableServiceSpy.selectedRows$ = selectedRowsSource.asObservable();
  }

  it("should create", () => {
    configureTestComponent({});
    expect(tableComponent).toBeTruthy();
  });

  it("should set the table service variables on init", () => {
    configureTestComponent({});
    expect(tableServiceSpy.tableName).toBe("countries");
    expect(tableServiceSpy.serverSide).toBeFalse();
    expect(tableServiceSpy.stateSave).toBeFalse();
    expect(tableServiceSpy.url).toBe("http://localhost:5000/data");
  });

  it("should fetch data on init", () => {
    configureTestComponent({});
    expect(tableServiceSpy.fetchData).toHaveBeenCalled();
  });

  it("should set the data correctly when data$ emits data", () => {
    configureTestComponent({});
    testHostFixture.detectChanges();
    dataSource.next(countries["data"]);
    expect(tableComponent.data).toEqual(countries["data"]);
  });

  it("should set the loading correctly when loading$ emits data", () => {
    configureTestComponent({});
    testHostFixture.detectChanges();
    loadingSource.next(true);
    expect(tableComponent.loading).toBeTrue();
    loadingSource.next(false);
    expect(tableComponent.loading).toBeFalse();
  });

  it("should set the table stats correctly when tableStats$ emits data", () => {
    configureTestComponent({});
    testHostFixture.detectChanges();
    tableStatsSource.next({
      start: 0,
      end: 10,
      totalRecords: 100,
      filteredRecords: 50,
    });
    expect(tableComponent.totalDataRecodsLength).toBe(100);
    expect(tableComponent.filteredCount).toBe(50);
    expect(tableComponent.start).toBe(0);
    expect(tableComponent.end).toBe(10);
  });

  it("should set the data with expanded property when expandableRows is true", () => {
    configureTestComponent({ expandableRows: true });
    testHostFixture.detectChanges();
    dataSource.next(countries["data"]);
    expect(tableComponent.data[0].expanded).toBeFalse();
  });

  it("should set the data with selected property when selectableRows is true", () => {
    configureTestComponent({ selectableRows: true });
    testHostFixture.detectChanges();
    dataSource.next(countries["data"]);
    expect(tableComponent.data[0].selected).toBeFalse();
  });

  it("should emit rowsSelected event when rows are selected", () => {
    configureTestComponent({ selectableRows: true });
    testHostFixture.detectChanges();
    dataSource.next(countries["data"]);
    tableComponent.data[0].selected = true;
    selectedRowsSource.next([tableComponent.data[0]]);
    expect(testHostComponent.rowsSelected).toBeTrue();
  });

  it("should set the header template correctly in ngAfterContentInit", () => {
    configureTestComponent({});
    testHostFixture.detectChanges();
    dataSource.next(countries["data"]);
    tableComponent.ngAfterContentInit();
    expect(tableComponent.header).toBeTruthy();
  });

  it("should set the body template correctly in ngAfterContentInit", () => {
    configureTestComponent({});
    testHostFixture.detectChanges();
    dataSource.next(countries["data"]);
    tableComponent.ngAfterContentInit();
    expect(tableComponent.body).toBeTruthy();
  });

  it("should set the loadingBodyTemplate correctly in ngAfterContentInit", () => {
    configureTestComponent({});
    testHostFixture.detectChanges();
    dataSource.next(countries["data"]);
    tableComponent.ngAfterContentInit();
    expect(tableComponent.loadingBodyTemplate).toBeTruthy();
  });

  it("should set the tableActions template correctly in ngAfterContentInit", () => {
    configureTestComponent({});
    testHostFixture.detectChanges();
    dataSource.next(countries["data"]);
    tableComponent.ngAfterContentInit();
    expect(tableComponent.tableActions).toBeTruthy();
  });

  it("should set the groupHeaderTemplate template correctly in ngAfterContentInit", () => {
    configureTestComponent({});
    testHostFixture.detectChanges();
    dataSource.next(countries["data"]);
    tableComponent.ngAfterContentInit();
    expect(tableComponent.groupHeaderTemplate).toBeTruthy();
  });

  it("should call onSort and reset other headers", () => {
    configureTestComponent({});
    const sortEvent: SortEvent<any> = { column: "name", direction: "asc" };
    tableComponent.headers.forEach((header) => {
      header.direction = "desc";
    });
    tableComponent.onSort(sortEvent);
    tableComponent.headers.forEach((header) => {
      if (header.sortableColumn !== sortEvent.column) {
        expect(header.direction).toBe("null");
      }
    });
    expect(tableServiceSpy.sortColumn).toBe(sortEvent.column);
    expect(tableServiceSpy.sortDirection).toBe(sortEvent.direction);
  });

  it("should call checkIfAllChecked and update selectedRows", () => {
    configureTestComponent({ selectableRows: true });
    dataSource.next(countries["data"]);
    tableComponent.data[0].selected = true;
    tableComponent.checkIfAllChecked();
    expect(tableComponent.selectedRows.length).toBe(1);
    expect(tableComponent.tableService.onSelectedRowsChanged).toHaveBeenCalledOnceWith(tableComponent.selectedRows);
  });

  it("should call clearFilters and remove filters from search", () => {
    configureTestComponent({});
    spyOn(tableComponent.filters.first, "removeFromSearch");
    tableComponent.clearFilters();
    expect(tableComponent.filters.first.removeFromSearch).toHaveBeenCalled();
  });

  it("should support grouping rows", () => {
    configureTestComponent({ groupRow: "continent" });
    dataSource.next(countries["data"]);
    expect(tableServiceSpy.groupRow).toBe(tableComponent.tableConfig.groupRow);
    expect(tableServiceSpy.sortColumn).toBe(tableComponent.tableConfig.groupRow);
    expect(tableServiceSpy.sortDirection).toBe("asc");
  });

  it("should set the table caption and summary", () => {
    configureTestComponent({});
    const captionElement: HTMLElement = testHostFixture.debugElement.query(By.css("caption")).nativeElement;
    expect(captionElement.textContent).toContain(testHostComponent.config.tableCaption);
    expect(captionElement.textContent).toContain(testHostComponent.config.tableSummary);
  });

  describe("HeaderConfigDirective", () => {
    let headerConfig: HeaderConfigDirective<any>;
    let headerConfigDebugElement: () => DebugElement;
    let renderer: Renderer2;

    beforeEach(() => {
      configureTestComponent({});
      headerConfigDebugElement = () => testHostFixture.debugElement.query(By.directive(HeaderConfigDirective));
      headerConfig = headerConfigDebugElement().injector.get(HeaderConfigDirective);
      renderer = TestBed.inject(Renderer2);
      tableComponent = testHostFixture.debugElement.query(By.directive(TableComponent)).componentInstance;
    });

    it("should create an instance", () => {
      expect(headerConfig).toBeTruthy();
    });

    it("should set up check all checkbox if selectableRows is true", () => {
      configureTestComponent({ selectableRows: true });
      headerConfig.ngOnInit();
      const headerRowElement: HTMLElement = headerConfigDebugElement().nativeElement;
      const thElements: NodeListOf<HTMLTableCellElement> = headerRowElement.querySelectorAll("th");
      expect(thElements.length).toBeGreaterThan(0);
      const checkboxComponent: Element = thElements[0].querySelector("app-table-row-checkbox");
      expect(checkboxComponent).toBeTruthy();
    });

    it("should set up expanded row column if expandableRows is true", () => {
      configureTestComponent({ expandableRows: true });
      headerConfig.ngOnInit();
      const headerRowElement: HTMLElement = headerConfigDebugElement().nativeElement;
      const thElements: NodeListOf<HTMLTableCellElement> = headerRowElement.querySelectorAll("th");
      expect(thElements.length).toBeGreaterThan(0);
    });

    it("should add a cell to the filter row if selectableRows is true", () => {
      configureTestComponent({ selectableRows: true });
      // testHostFixture.detectChanges();
      headerConfig.ngOnInit();
      const headerThElements: NodeListOf<HTMLTableCellElement> =
        headerConfigDebugElement().nativeElement.querySelectorAll("th");
      const filterRow: HTMLElement = headerConfigDebugElement().nativeElement.nextElementSibling;
      const thElements: NodeListOf<HTMLTableCellElement> = filterRow.querySelectorAll("th");
      expect(thElements.length).toEqual(headerThElements.length);
    });

    it("should add a cell to the filter row if expandableRows is true", () => {
      configureTestComponent({ expandableRows: true });
      headerConfig.ngOnInit();
      const headerThElements: NodeListOf<HTMLTableCellElement> =
        headerConfigDebugElement().nativeElement.querySelectorAll("th");
      const filterRow: HTMLElement = headerConfigDebugElement().nativeElement.nextElementSibling;
      const thElements: NodeListOf<HTMLTableCellElement> = filterRow.querySelectorAll("th");
      expect(thElements.length).toEqual(headerThElements.length);
    });

    it("should not add a cell to the filter row if there are no filters", () => {
      configureTestComponent({ expandableRows: true, selectableRows: true });
      document.querySelector(".column-filter-headers").remove();
      testHostFixture.detectChanges();
      headerConfig.ngOnInit();
      const filterRow: HTMLElement = headerConfigDebugElement().nativeElement.nextElementSibling;
      expect(filterRow).toBeNull();
    });
  });

  describe("AppTemplateDirective", () => {
    let templateRef: TemplateRef<any>;
    let directive: AppTemplateDirective;

    beforeEach(() => {
      templateRef = {} as TemplateRef<any>;
      directive = new AppTemplateDirective(templateRef);
    });

    // the rest of what this does is covered in the Table unit tests
    it("should throw an error if name is undefined when getType is called", () => {
      directive.name = undefined;
      expect(() => directive.getType()).toThrowError("Name is undefined");
    });
  });

  describe("RowConfigDirective", () => {
    let rowConfig: RowConfigDirective<any>;
    let rowConfigDebugElement: () => DebugElement;
    let renderer: Renderer2;

    beforeEach(() => {
      configureTestComponent({});
      testHostFixture.detectChanges();
      dataSource.next(countries["data"]);
      testHostFixture.detectChanges();
      rowConfigDebugElement = () => testHostFixture.debugElement.query(By.directive(RowConfigDirective));
      rowConfig = rowConfigDebugElement().injector.get(RowConfigDirective);
      renderer = TestBed.inject(Renderer2);
      tableComponent = testHostFixture.debugElement.query(By.directive(TableComponent)).componentInstance;
    });

    it("should create an instance", () => {
      expect(rowConfig).toBeTruthy();
    });

    it("should set up row selection checkbox if selectableRows is true", () => {
      configureTestComponent({ selectableRows: true });
      dataSource.next(countries["data"]);
      rowConfig.rowData = countries["data"][0];
      rowConfig.ngOnInit();
      testHostFixture.detectChanges();
      const rowElement: HTMLElement = rowConfigDebugElement().nativeElement;
      const tdElements: NodeListOf<HTMLTableCellElement> = rowElement.querySelectorAll("td");
      expect(tdElements.length).toBeGreaterThan(0);
      const checkboxComponent: Element = tdElements[0].querySelector("app-table-row-checkbox");
      expect(checkboxComponent).toBeTruthy();
    });

    it("should set up expand/collapse row icon if expandableRows is true", () => {
      configureTestComponent({ expandableRows: true });
      dataSource.next(countries["data"]);
      rowConfig.rowData = countries["data"][0];
      rowConfig.ngOnInit();
      testHostFixture.detectChanges();
      const rowElement: HTMLElement = rowConfigDebugElement().nativeElement;
      const tdElements: NodeListOf<HTMLTableCellElement> = rowElement.querySelectorAll("td");
      expect(tdElements.length).toBeGreaterThan(0);
      const iconComponent: Element = tdElements[0].querySelector("fa-icon");
      expect(iconComponent).toBeTruthy();
    });

    it("should update the expand/collapse icon based on the current state of the row", () => {
      configureTestComponent({ expandableRows: true });
      dataSource.next(countries["data"]);
      rowConfig.rowData = tableComponent.data[0];
      rowConfig.rowData.expanded = true;
      rowConfig.ngOnInit();
      testHostFixture.detectChanges();
      rowConfig.expandIconUpdate();
      const rowElement: HTMLElement = rowConfigDebugElement().nativeElement;
      const iconComponent: HTMLElement = rowElement.querySelector("fa-icon svg");
      expect(iconComponent).toBeTruthy();
      expect(iconComponent.classList).toContain("fa-circle-chevron-down");
    });

    it("should toggle the expanded state of the row when the icon is clicked", () => {
      configureTestComponent({ expandableRows: true });
      dataSource.next(countries["data"]);
      rowConfig.rowData = tableComponent.data[0];
      rowConfig.ngOnInit();
      testHostFixture.detectChanges();
      const rowElement: HTMLElement = rowConfigDebugElement().nativeElement;
      const expandedTd: HTMLElement = rowElement.querySelector("td fa-icon");
      expandedTd.click();
      testHostFixture.detectChanges();
      expect(rowConfig.rowData.expanded).toBeTrue();
      expect(testHostFixture.debugElement.query(By.css(".expanded-row"))).toBeTruthy();
    });
  });

  describe("SortableHeaderDirective", () => {
    let sortableHeader: SortableHeaderDirective<any>;
    let sortableHeaderDebugElement: () => DebugElement;
    let renderer: Renderer2;

    beforeEach(() => {
      configureTestComponent({});
      sortableHeaderDebugElement = () => testHostFixture.debugElement.query(By.directive(SortableHeaderDirective));
      sortableHeader = sortableHeaderDebugElement().injector.get(SortableHeaderDirective);
      renderer = TestBed.inject(Renderer2);
      tableComponent = testHostFixture.debugElement.query(By.directive(TableComponent)).componentInstance;
    });

    it("should create an instance", () => {
      expect(sortableHeader).toBeTruthy();
    });

    it("should set cursor style to pointer on initialization", () => {
      const element: HTMLElement = sortableHeaderDebugElement().nativeElement;
      expect(element.style.cursor).toBe("pointer");
    });

    it("should add 'asc' class if direction is 'asc'", () => {
      sortableHeader.direction = "asc";
      testHostFixture.detectChanges();
      const element: HTMLElement = sortableHeaderDebugElement().nativeElement;
      expect(element.classList).toContain("asc");
    });

    it("should add 'desc' class if direction is 'desc'", () => {
      sortableHeader.direction = "desc";
      testHostFixture.detectChanges();
      const element: HTMLElement = sortableHeaderDebugElement().nativeElement;
      expect(element.classList).toContain("desc");
    });

    it("should call rotate method on click", () => {
      spyOn(sortableHeader, "rotate");
      const element: HTMLElement = sortableHeaderDebugElement().nativeElement;
      element.click();
      expect(sortableHeader.rotate).toHaveBeenCalled();
    });

    it("should rotate the sort direction and update the table", () => {
      spyOn(sortableHeader, "updateIcon");
      spyOn(tableComponent, "onSort");
      sortableHeader.direction = "asc";
      sortableHeader.rotate();
      expect(sortableHeader.direction).toBe("desc");
      expect(tableComponent.onSort).toHaveBeenCalledWith({ column: sortableHeader.sortableColumn, direction: "desc" });
      expect(sortableHeader.updateIcon).toHaveBeenCalled();
    });

    it("should update the icon based on the current sort direction", () => {
      sortableHeader.direction = "asc";
      sortableHeader.updateIcon();
      testHostFixture.detectChanges();
      const element: HTMLElement = sortableHeaderDebugElement().nativeElement;
      const iconComponent: HTMLElement = element.querySelector("fa-icon svg");
      expect(iconComponent).toBeTruthy();
      expect(iconComponent.classList).toContain("fa-arrow-up-short-wide");

      sortableHeader.direction = "desc";
      sortableHeader.updateIcon();
      testHostFixture.detectChanges();
      const iconComponentDesc: HTMLElement = element.querySelector("fa-icon svg");
      expect(iconComponentDesc).toBeTruthy();
      expect(iconComponentDesc.classList).toContain("fa-arrow-down-short-wide");
    });

    it("should remove existing icon if any", () => {
      sortableHeader.direction = "asc";
      sortableHeader.updateIcon();
      testHostFixture.detectChanges();
      sortableHeader.direction = "desc";
      sortableHeader.updateIcon();
      testHostFixture.detectChanges();
      const element: HTMLElement = sortableHeaderDebugElement().nativeElement;
      const iconComponents: NodeListOf<HTMLElement> = element.querySelectorAll("fa-icon svg");
      expect(iconComponents.length).toBe(1);
    });
  });
});
