import { ChangeDetectorRef, ElementRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectComponent, NgSelectModule } from "@ng-select/ng-select";
import { of } from "rxjs";
import { DatepickerComponent } from "../../datepicker/datepicker.component";

import { DateFilterComponent } from "./table-date-filter/table-date-filter.component";
import { TableService } from "../table.service";
import { ngSelectItems } from "../table-types";
import { TriStateCheckboxComponent } from "../../tri-state-checkbox/tri-state-checkbox.component";
import { AppTableFilterComponent } from "./table-filter.component";

describe("AppTableFilterComponent", () => {
  let component: AppTableFilterComponent<any>;
  let fixture: ComponentFixture<AppTableFilterComponent<any>>;
  let tableServiceMock: any;

  beforeEach(async () => {
    tableServiceMock = {
      filterStateRestore$: of({}),
      stateSave: true,
      restoreState: jasmine.createSpy("restoreState"),
      onSearchTermsChanged: jasmine.createSpy("onSearchTermsChanged"),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, NgbModule, FontAwesomeModule, NgSelectModule],
      declarations: [AppTableFilterComponent, DateFilterComponent, TriStateCheckboxComponent, DatepickerComponent],
      providers: [{ provide: TableService, useValue: tableServiceMock }, ChangeDetectorRef],
    }).compileComponents();

    fixture = TestBed.createComponent(AppTableFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function createFilter(
    column: string,
    type: "number" | "text" | "date" | "select" | "multi-select" | "checkbox",
  ): void {
    fixture = TestBed.createComponent(AppTableFilterComponent);
    component = fixture.componentInstance;
    component.column = column;
    component.type = type;
    component.placeholderText = "test";
    component.filterItems = ["item1", "item2", "item3"];

    fixture.detectChanges();
  }

  it("should create", () => {
    createFilter("name", "text");
    expect(component).toBeTruthy();
  });

  describe("ngAfterViewInit restore", () => {
    it("should restore state on ngAfterViewInit for text", () => {
      createFilter("name", "text");
      component.filterElementRef = new ElementRef(document.createElement("input"));
      tableServiceMock.filterStateRestore$ = of({
        name: { filterValue: "test" },
      });

      component.ngAfterViewInit();
      fixture.detectChanges();

      expect(component.filterElementRef.nativeElement.value).toBe("test");
      expect(tableServiceMock.restoreState).toHaveBeenCalledWith("name");
    });

    it("should restore state on ngAfterViewInit for date", () => {
      createFilter("date", "date");
      const dateFilterComponent: DateFilterComponent = new DateFilterComponent();
      dateFilterComponent.datePickerOne = fixture.debugElement.query(
        By.directive(DateFilterComponent),
      ).componentInstance;
      component.filterElementRef = dateFilterComponent;
      tableServiceMock.filterStateRestore$ = of({
        date: { filterValue: { dateType: "on", dateOne: new Date(), dateTwo: new Date() } },
      });

      component.ngAfterViewInit();
      fixture.detectChanges();

      expect(component.filterElementRef.dateType).toBe("on");
      expect(tableServiceMock.restoreState).toHaveBeenCalledWith("date");
    });

    it("should restore state on ngAfterViewInit for select", () => {
      createFilter("select", "select");
      tableServiceMock.filterStateRestore$ = of({
        select: { filterValue: "item1" },
      });

      component.ngAfterViewInit();
      fixture.detectChanges();

      expect(component.selectedItem).toEqual("item1");
      expect(tableServiceMock.restoreState).toHaveBeenCalledWith("select");
    });

    it("should restore state on ngAfterViewInit for multi-select", () => {
      createFilter("multi-select", "multi-select");
      tableServiceMock.filterStateRestore$ = of({
        "multi-select": { filterValue: ["item1", "item2"] },
      });

      component.ngAfterViewInit();
      fixture.detectChanges();

      expect(component.selectedItem).toEqual(["item1", "item2"] as unknown as ngSelectItems[]);
      expect(tableServiceMock.restoreState).toHaveBeenCalledWith("multi-select");
    });

    it("should restore state on ngAfterViewInit for checkbox", () => {
      createFilter("checkbox", "checkbox");
      const checkbox: TriStateCheckboxComponent = fixture.debugElement.query(
        By.directive(TriStateCheckboxComponent),
      ).componentInstance;
      tableServiceMock.filterStateRestore$ = of({
        checkbox: { filterValue: true },
      });

      component.ngAfterViewInit();
      fixture.detectChanges();

      expect(checkbox.value).toBeTrue();
      expect(tableServiceMock.restoreState).toHaveBeenCalledWith("checkbox");
    });
  });

  describe("buildSearchQuery", () => {
    it("should build search query for text", () => {
      createFilter("name", "text");
      component.filterElementRef = new ElementRef(document.createElement("input"));
      component.filterElementRef.nativeElement.value = "test";

      component.buildSearchQuery(null);

      expect(tableServiceMock.onSearchTermsChanged).toHaveBeenCalledWith({
        column: "name",
        value: "test",
        type: "text",
      });
    });

    it("should build search query for date", () => {
      createFilter("date", "date");
      component.filterElementRef = new DateFilterComponent();
      const dateOne: Date = new Date("2021-01-01");
      const dateTwo: Date = new Date("2021-01-02");

      component.buildSearchQuery({ dateType: "between", dateOne, dateTwo });

      expect(tableServiceMock.onSearchTermsChanged).toHaveBeenCalledWith({
        column: "date",
        value: { dateType: "between", dateOne, dateTwo },
        type: "date",
      });
    });

    it("should build search query for select", () => {
      createFilter("select", "select");

      const ngSelect: NgSelectComponent = fixture.debugElement.query(By.directive(NgSelectComponent)).componentInstance;
      ngSelect.select({ label: "item1", value: "item1" });

      component.buildSearchQuery("item1");

      expect(tableServiceMock.onSearchTermsChanged).toHaveBeenCalledWith({
        column: "select",
        value: "item1",
        type: "select",
      });
    });

    it("should build search query for multi-select", () => {
      createFilter("multi-select", "multi-select");

      const ngSelect: NgSelectComponent = fixture.debugElement.query(By.directive(NgSelectComponent)).componentInstance;
      ngSelect.select({ label: "item1", value: "item1" });
      ngSelect.select({ label: "item2", value: "item2" });

      component.buildSearchQuery(["test", "test2"]);

      expect(tableServiceMock.onSearchTermsChanged).toHaveBeenCalledWith({
        column: "multi-select",
        value: ["item1", "item2"],
        type: "multi-select",
      });
    });

    it("should build search query for checkbox", () => {
      createFilter("checkbox", "checkbox");
      const checkbox: TriStateCheckboxComponent = fixture.debugElement.query(
        By.directive(TriStateCheckboxComponent),
      ).componentInstance;
      checkbox.onClick();
      fixture.detectChanges();

      expect(tableServiceMock.onSearchTermsChanged).toHaveBeenCalledWith({
        column: "checkbox",
        value: true,
        type: "checkbox",
      });
    });
  });

  describe("removeFromSearch", () => {
    it("should remove search query for text", () => {
      createFilter("name", "text");
      component.filterElementRef = new ElementRef(document.createElement("input"));
      component.filterElementRef.nativeElement.value = "test";

      component.removeFromSearch();

      expect(component.filterElementRef.nativeElement.value).toBe("");
      expect(tableServiceMock.onSearchTermsChanged).toHaveBeenCalledWith({
        column: "name",
        value: null,
        type: "text",
      });
    });

    it("should remove search query for date", () => {
      createFilter("date", "date");
      component.filterElementRef = new DateFilterComponent();

      component.removeFromSearch();

      expect(component.filterElementRef.clear).toBeTrue();
      expect(tableServiceMock.onSearchTermsChanged).toHaveBeenCalledWith({
        column: "date",
        value: null,
        type: "date",
      });
    });

    it("should remove search query for select", () => {
      createFilter("select", "select");

      const ngSelect: NgSelectComponent = fixture.debugElement.query(By.directive(NgSelectComponent)).componentInstance;
      ngSelect.select({ label: "item1", value: "item1" });

      component.removeFromSearch();

      expect(tableServiceMock.onSearchTermsChanged).toHaveBeenCalledWith({
        column: "select",
        value: null,
        type: "select",
      });
    });

    it("should remove search query for multi-select", () => {
      createFilter("multi-select", "multi-select");

      const ngSelect: NgSelectComponent = fixture.debugElement.query(By.directive(NgSelectComponent)).componentInstance;
      ngSelect.select({ label: "item1", value: "item1" });
      ngSelect.select({ label: "item2", value: "item2" });

      component.removeFromSearch();

      expect(tableServiceMock.onSearchTermsChanged).toHaveBeenCalledWith({
        column: "multi-select",
        value: null,
        type: "multi-select",
      });
    });

    it("should remove search query for checkbox", () => {
      createFilter("checkbox", "checkbox");
      const checkbox: TriStateCheckboxComponent = fixture.debugElement.query(
        By.directive(TriStateCheckboxComponent),
      ).componentInstance;
      checkbox.onClick();
      fixture.detectChanges();

      component.removeFromSearch();

      expect(tableServiceMock.onSearchTermsChanged).toHaveBeenCalledWith({
        column: "checkbox",
        value: null,
        type: "checkbox",
      });
    });
  });
});
