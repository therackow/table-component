import { DebugElement, SimpleChange } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";

import { NgbDateStruct, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DatepickerComponent } from "../../../datepicker/datepicker.component";

import { DateFilterComponent } from "./table-date-filter.component";

describe("DateFilterComponent", () => {
  let component: DateFilterComponent;
  let fixture: ComponentFixture<DateFilterComponent>;
  const datepickerElements: () => DebugElement[] = () => fixture.debugElement.queryAll(By.css("app-datepicker"));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgbModule, FormsModule],
      declarations: [DateFilterComponent, DatepickerComponent, DatepickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should emit datePicked with null when both dates are null", () => {
    spyOn(component.datePicked, "emit");
    component.dateFilterObject.dateOne = null;
    component.dateFilterObject.dateTwo = null;
    component.emit();
    expect(component.datePicked.emit).toHaveBeenCalledWith(null);
  });

  it("should emit datePicked with dateFilterObject when one date is set", () => {
    spyOn(component.datePicked, "emit");
    component.dateFilterObject.dateOne = "2023-10-01";
    component.dateFilterObject.dateTwo = null;
    component.emit();
    expect(component.datePicked.emit).toHaveBeenCalledWith(component.dateFilterObject);
  });

  it("should update dateFilterObject dateOne and emit when dateSelected is called", () => {
    spyOn(component, "emit");
    const date: NgbDateStruct = { year: 2023, month: 10, day: 1 };
    component.dateSelected({ date }, 1);
    expect(component.dateFilterObject.dateOne).toBe("2023-10-01");
    expect(component.emit).toHaveBeenCalled();
  });

  it("should update dateFilterObject dateOne to null and emit when dateSelected is called", () => {
    spyOn(component, "emit");
    const date: NgbDateStruct = undefined;
    component.dateSelected({ date }, 1);
    expect(component.dateFilterObject.dateOne).toBeNull();
    expect(component.emit).toHaveBeenCalled();
  });

  it("should update dateFilterObject dateTwo and emit when dateSelected is called", () => {
    spyOn(component, "emit");
    const date: NgbDateStruct = { year: 2023, month: 10, day: 1 };
    component.dateSelected({ date }, 2);
    expect(component.dateFilterObject.dateTwo).toBe("2023-10-01");
    expect(component.emit).toHaveBeenCalled();
  });

  it("should update dateFilterObject dateTwo to null and emit when dateSelected is called", () => {
    spyOn(component, "emit");
    const date: NgbDateStruct = null;
    component.dateSelected({ date }, 2);
    expect(component.dateFilterObject.dateTwo).toBeNull();
    expect(component.emit).toHaveBeenCalled();
  });

  it("should clear dates and emit when dateSelectTypeChange is called", () => {
    spyOn(component, "emit");
    component.dateSelectTypeChange();
    expect(component.dateFilterObject.dateOne).toBeNull();
    expect(component.dateFilterObject.dateTwo).toBeNull();
    expect(component.emit).toHaveBeenCalled();
  });

  it("should call ngOnChanges and update datePickerOne when preloadedDateOne is set", fakeAsync(() => {
    component.preloadedDateOne = "2023-10-01";
    component.datePickerOne = jasmine.createSpyObj("DatepickerComponent", ["ngOnChanges"]);
    component.ngOnChanges({});
    tick();
    expect(component.datePickerOne.ngOnChanges).toHaveBeenCalledOnceWith({
      preLoadedDate: new SimpleChange(undefined, component.preloadedDateOne, true),
    });
  }));

  it("should have only one datepicker input when dateType is on, before, or after", () => {
    expect(datepickerElements().length).toBe(1);
    component.dateType = "before";
    fixture.detectChanges();
    expect(datepickerElements().length).toBe(1);
    component.dateType = "after";
    fixture.detectChanges();
    expect(datepickerElements().length).toBe(1);
  });

  it("should have two datepicker inputs when dateType is between", () => {
    component.dateType = "between";
    fixture.detectChanges();
    expect(datepickerElements().length).toBe(2);
  });
});
