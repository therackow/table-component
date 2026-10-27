import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { TriStateCheckboxComponent } from "./tri-state-checkbox.component";

describe("TriStateCheckboxComponent", () => {
  let component: TriStateCheckboxComponent;
  let fixture: ComponentFixture<TriStateCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontAwesomeModule],
      declarations: [TriStateCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TriStateCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with null value", () => {
    expect(component.value).toBeNull();
  });

  it("should cycle value from null to true on first click", () => {
    component.onClick();
    fixture.detectChanges();
    expect(component.value).toBeTrue();
    expect(fixture.debugElement.query(By.css(".fa-square-check"))).toBeTruthy();
  });

  it("should cycle value from true to false on second click", () => {
    component.value = true;
    component.onClick();
    fixture.detectChanges();
    expect(component.value).toBeFalse();
    expect(fixture.debugElement.query(By.css(".fa-square-xmark"))).toBeTruthy();
  });

  it("should cycle value from false to null on third click", () => {
    component.value = false;
    component.onClick();
    fixture.detectChanges();
    expect(component.value).toBeNull();
    expect(fixture.debugElement.query(By.css(".fa-square"))).toBeTruthy();
  });

  it("should emit the updated value on click", () => {
    spyOn(component.checkboxUpdated, "emit");
    component.onClick();
    expect(component.checkboxUpdated.emit).toHaveBeenCalledWith(true);
    component.onClick();
    expect(component.checkboxUpdated.emit).toHaveBeenCalledWith(false);
    component.onClick();
    expect(component.checkboxUpdated.emit).toHaveBeenCalledWith(null);
  });
});
