import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { Observable, of, Subject } from "rxjs";

import { TableService } from "../table.service";
import { TableData, TableStats } from "../table-types";
import { TableComponent } from "../table.component";
import { TableRowCheckboxComponent } from "./table-row-checkbox.component";

describe("TableRowCheckboxComponent", () => {
  let component: TableRowCheckboxComponent<any>;
  let fixture: ComponentFixture<TableRowCheckboxComponent<any>>;
  let tableService: TableService<any>;
  let tableComponent: TableComponent<any>;

  beforeEach(async () => {
    const tableServiceMock: {
      tableStats$: Observable<TableStats>;
      selectedRows$: Observable<any[]>;
      selectAll$: Observable<boolean>;
      onSelectAllChanged: jasmine.Spy<jasmine.Func>;
    } = {
      tableStats$: of({ start: 1, end: 10 } as TableStats),
      selectedRows$: of([]),
      selectAll$: of(false),
      onSelectAllChanged: jasmine.createSpy("onSelectAllChanged"),
    };

    const tableComponentMock: {
      data: any[];
      checkIfAllChecked: jasmine.Spy<jasmine.Func>;
    } = {
      data: [{ id: 1, name: "Test Row", selected: false }],
      checkIfAllChecked: jasmine.createSpy("checkIfAllChecked"),
    };

    await TestBed.configureTestingModule({
      declarations: [TableRowCheckboxComponent],
      providers: [
        { provide: TableService, useValue: tableServiceMock },
        { provide: TableComponent, useValue: tableComponentMock },
      ],
      imports: [FontAwesomeModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableRowCheckboxComponent);
    component = fixture.componentInstance;
    tableService = TestBed.inject(TableService);
    tableComponent = TestBed.inject(TableComponent);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with default values", () => {
    expect(component.value).toBeFalse();
    expect(component.faSquareCheck).toBeDefined();
    expect(component.faSquare).toBeDefined();
  });

  it("should be true and checked if the mode is header and the selected rows equals total rows", () => {
    component.mode = "header";
    fixture.detectChanges();
    tableService.selectedRows$ = of(new Array(10).fill({}));
    component.ngAfterViewInit();
    fixture.detectChanges();
    expect(component.value).toBeTrue();
  });

  it("should be false and unchecked if the mode is header and the selected rows equals total rows", () => {
    component.mode = "header";
    fixture.detectChanges();
    tableService.selectedRows$ = of(new Array(9).fill({}));
    component.ngAfterViewInit();
    fixture.detectChanges();
    expect(component.value).toBeFalse();
  });

  it("should be true and checked if selectAll$ fires as true", () => {
    component.mode = "body";
    fixture.detectChanges();
    tableService.selectAll$ = of(true);
    component.ngAfterViewInit();
    fixture.detectChanges();
    expect(component.value).toBeTrue();
  });

  it("should be false and unchecked if selectAll$ fires as false", () => {
    component.mode = "body";
    fixture.detectChanges();
    tableService.selectAll$ = of(false);
    component.ngAfterViewInit();
    fixture.detectChanges();
    expect(component.value).toBeFalse();
  });

  it("should not do anything on ngOnInit if tableState is not set", () => {
    const selectedRowsSpy: jasmine.Spy = spyOn(tableService.selectedRows$, "subscribe");
    const selectAllSpy: jasmine.Spy = spyOn(tableService.selectAll$, "subscribe");
    component.ngAfterViewInit();
    expect(selectedRowsSpy).not.toHaveBeenCalled();
    expect(selectAllSpy).not.toHaveBeenCalled();
  });

  it("should call onSelectAllChanged and checkIfAllChecked when header checkbox is clicked", () => {
    component.mode = "header";
    component.onClick();
    expect(tableService.onSelectAllChanged).toHaveBeenCalledWith(true);
    expect(tableComponent.checkIfAllChecked).toHaveBeenCalled();
  });

  it("should update rowData selected and call checkIfAllChecked when body checkbox is clicked", () => {
    component.mode = "body";
    component.rowData = { selected: false } as TableData<any>;
    tableComponent.data = [component.rowData];
    component.onClick();
    expect(component.rowData.selected).toBeTrue();
    expect(tableComponent.checkIfAllChecked).toHaveBeenCalled();
  });

  it("should complete destroy$ on ngOnDestroy", () => {
    const destroySpy: jasmine.Spy = spyOn(component["destroy$"], "next");
    const completeSpy: jasmine.Spy = spyOn(component["destroy$"], "complete");
    component.ngOnDestroy();
    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
