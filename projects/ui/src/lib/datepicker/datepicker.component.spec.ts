import { DebugElement, SimpleChange } from "@angular/core";
import { waitForAsync, ComponentFixture, TestBed, fakeAsync, flush } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";

import {
  NgbDatepickerModule,
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDateStruct,
  NgbDate,
} from "@ng-bootstrap/ng-bootstrap";

import { i18nMonths } from "../i18n-months";
import { AppDatePipe } from "../pipes/app-date.pipe";
import { DatepickerComponent, NgbDateAppParserFormatter, AppDatepickerI18n } from "./datepicker.component";

describe("DatepickerComponent", () => {
  let component: DatepickerComponent;
  let fixture: ComponentFixture<DatepickerComponent>;

  const datepickerInput: () => DebugElement = () => fixture.debugElement.query(By.css("input"));
  const datepicker: () => DebugElement = () => fixture.debugElement.query(By.css("ngb-datepicker"));
  const monthOptions: () => DebugElement[] = () =>
    fixture.debugElement.queryAll(By.css("ngb-datepicker-navigation-select select:nth-child(1) option"));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DatepickerComponent],
      imports: [NgbDatepickerModule, FormsModule],
      providers: [
        AppDatePipe,
        {
          provide: NgbDateParserFormatter,
          useClass: NgbDateAppParserFormatter,
        },
        {
          provide: NgbDatepickerI18n,
          useClass: AppDatepickerI18n,
        },
      ],
    }).compileComponents();
  }));

  function clickInput(): void {
    datepickerInput().triggerEventHandler("click", null);
    fixture.detectChanges();
  }

  function createComponent(
    lang: string = "en",
    preloadDate?: any,
    maxDate?: NgbDateStruct,
    minDate?: NgbDateStruct,
  ): void {
    fixture = TestBed.createComponent(DatepickerComponent);
    component = fixture.componentInstance;
    component.locale = lang;
    if (preloadDate) {
      component.preLoadedDate = preloadDate;
    }
    if (maxDate) {
      component.maxDate = maxDate;
    }
    if (minDate) {
      component.minDate = minDate;
    }
    fixture.detectChanges();
  }

  it("should create", () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it("should default to closed", () => {
    createComponent();
    expect(datepicker()).toBeFalsy();
  });

  it("should be able to be opened", () => {
    createComponent();
    clickInput();
    expect(datepicker()).toBeTruthy();
  });

  it("should should be able to be opened and closed", () => {
    createComponent();
    clickInput();
    expect(datepicker()).toBeTruthy();
    clickInput();
    expect(datepicker()).toBeFalsy();
  });

  it("should default to english", () => {
    createComponent();
    expect(component.locale).toBe("en");
  });

  it("should be configurable to have the container in the body", () => {
    createComponent();
    component.container = "body";
    fixture.detectChanges();
    expect(component.container).toBe("body");
  });

  it("should let the language get changed", () => {
    createComponent("fr-fr");
    expect(component.locale).toBe("fr-fr");
    clickInput();
    monthOptions().forEach((element: DebugElement, index: number) => {
      expect(element.nativeElement.textContent.toLowerCase()).toBe(i18nMonths["fr-fr"].shortMonths[index]);
    });
  });

  it("should have the correct format when a AppDate is preloaded", fakeAsync(() => {
    createComponent("en", "01-JAN-2019");
    const change: SimpleChange = new SimpleChange(null, "01-JAN-2019", true);
    component.ngOnChanges({ preLoadedDate: change });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(datepickerInput().nativeElement.value).toBe("01-JAN-2019");
    });
  }));

  it("should have the correct format when a jsDate is preloaded", fakeAsync(() => {
    createComponent("en", "2019-1-1");
    const change: SimpleChange = new SimpleChange(null, "2019-01-01", true);
    component.ngOnChanges({ preLoadedDate: change });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(datepickerInput().nativeElement.value).toBe("01-JAN-2019");
    });
  }));

  it("should be allowed to clear the date from the componenet", fakeAsync(() => {
    createComponent("en", "2019-01-01");
    let change: SimpleChange = new SimpleChange(null, "2019-01-01", true);
    component.ngOnChanges({ preLoadedDate: change });
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(datepickerInput().nativeElement.value).toBe("01-JAN-2019");
      component.clear = true;
      fixture.detectChanges();
      change = new SimpleChange(null, true, false);
      component.ngOnChanges({ clear: change });
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(datepickerInput().nativeElement.value).toBe("");
      });
    });
  }));

  it("should allow for the date to be manually entered", fakeAsync(() => {
    createComponent();
    datepickerInput().nativeElement.value = "06-JUN-2022";
    datepickerInput().triggerEventHandler("change", { target: { value: "06-JUN-2022" } });
    fixture.detectChanges();
    expect(component.date).toEqual({ day: 6, month: 6, year: 2022 });
  }));

  it("should allow for the date to be manually entered with a single digit date", fakeAsync(() => {
    createComponent();
    datepickerInput().nativeElement.value = "6-JUN-2022";
    datepickerInput().triggerEventHandler("change", { target: { value: "6-JUN-2022" } });
    fixture.detectChanges();
    expect(component.date).toEqual({ day: 6, month: 6, year: 2022 });
  }));

  it("should be able to open the datepicker programmatically", fakeAsync(() => {
    createComponent();
    component.open();
    fixture.detectChanges();
    const datepickerEl: DebugElement = fixture.debugElement.query(By.css("ngb-datepicker"));
    expect(datepickerEl).toBeTruthy();
    flush();
  }));

  it("should be able to toggle the datepicker programmatically", fakeAsync(() => {
    createComponent();
    component.toggle();
    fixture.detectChanges();
    let datepickerEl: DebugElement = fixture.debugElement.query(By.css("ngb-datepicker"));
    expect(datepickerEl).toBeTruthy();
    component.toggle();
    fixture.detectChanges();
    datepickerEl = fixture.debugElement.query(By.css("ngb-datepicker"));
    expect(datepickerEl).toBeFalsy();
    flush();
  }));

  it("should allow for a max date", fakeAsync(() => {
    const today: Date = new Date();
    const tomorrow: Date = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const ngbToday: NgbDate = new NgbDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const ngbTomorrow: NgbDate = new NgbDate(tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate());
    const todayString: string = `${ngbToday.day}-${ngbToday.month}-${ngbToday.year}`;
    const tomorrowString: string = `${ngbTomorrow.day}-${ngbTomorrow.month}-${ngbTomorrow.year}`;
    createComponent("en", null, ngbToday);
    component.open();
    fixture.detectChanges();
    const todayNode: DebugElement = fixture.debugElement.query(By.css(`[aria-label="${todayString}"]`));
    const tomorrowNode: DebugElement = fixture.debugElement.query(By.css(`[aria-label="${tomorrowString}"]`));
    expect(todayNode.classes["disabled"]).toBeUndefined();
    expect(todayNode.classes["ngb-dp-today"]).toBeTrue();
    expect(tomorrowNode.classes["disabled"]).toBeTrue();
    flush();
  }));

  it("should default to not disabled", () => {
    createComponent();
    expect(datepickerInput().nativeElement.disabled).toBeFalse();
  });

  it("should disable the input and not open the datepicker when disabled is true", () => {
    createComponent();
    component.disabled = true;
    fixture.detectChanges();
    expect(datepickerInput().nativeElement.disabled).toBeTrue();
    clickInput();
    expect(datepicker()).toBeFalsy();
  });

  it("should emit the date with the blur event", fakeAsync(() => {
    createComponent();
    const dateSpy: jasmine.Spy = spyOn(component.dateBlur, "emit");
    datepickerInput().nativeElement.value = "6-JUN-2022";
    fixture.detectChanges();
    datepickerInput().triggerEventHandler("blur", { target: datepickerInput().nativeElement });
    fixture.detectChanges();
    expect(dateSpy).toHaveBeenCalledWith({ date: { day: 6, month: 6, year: 2022 } });
  }));
});

describe("NgbDateAppParserFormatter", () => {
  it("create an instance", () => {
    const parserFormatter: NgbDateAppParserFormatter = new NgbDateAppParserFormatter(new AppDatePipe());
    expect(parserFormatter).toBeTruthy();
  });

  describe("parsing", () => {
    it("Can parse the App date format", () => {
      const parserFormatter: NgbDateAppParserFormatter = new NgbDateAppParserFormatter(new AppDatePipe());
      parserFormatter.locale = "en";
      const result: NgbDateStruct = parserFormatter.parse("01-May-2019");
      expect(result.day).toBe(1);
      expect(result.month).toBe(5);
      expect(result.year).toBe(2019);
    });

    it("Will not parse JS Date format", () => {
      const parserFormatter: NgbDateAppParserFormatter = new NgbDateAppParserFormatter(new AppDatePipe());
      parserFormatter.locale = "en";
      const result: NgbDateStruct = parserFormatter.parse("2019-05-01");
      expect(result).toBe(null);
    });

    it("Will not parse RoW Date format", () => {
      const parserFormatter: NgbDateAppParserFormatter = new NgbDateAppParserFormatter(new AppDatePipe());
      parserFormatter.locale = "en";
      const result: NgbDateStruct = parserFormatter.parse("01-05-2019");
      expect(result).toBe(null);
    });

    it("Will not parse US Date format", () => {
      const parserFormatter: NgbDateAppParserFormatter = new NgbDateAppParserFormatter(new AppDatePipe());
      parserFormatter.locale = "en";
      const result: NgbDateStruct = parserFormatter.parse("05-01-2019");
      expect(result).toBe(null);
    });

    it("Should be able to parse a foreign language App date", () => {
      const parserFormatter: NgbDateAppParserFormatter = new NgbDateAppParserFormatter(new AppDatePipe());
      parserFormatter.locale = "fr-fr";
      const result: NgbDateStruct = parserFormatter.parse("03-Aoû-2019");
      expect(result.day).toBe(3);
      expect(result.month).toBe(8);
      expect(result.year).toBe(2019);
    });

    it("Should return null if the parsed language is different from the host language", () => {
      const parserFormatter: NgbDateAppParserFormatter = new NgbDateAppParserFormatter(new AppDatePipe());
      parserFormatter.locale = "en";
      const result: NgbDateStruct = parserFormatter.parse("03-Aoû-2019");
      expect(result).toBe(null);
    });
  });

  describe("formatting", () => {
    it("Can take an NgbDateStruct and format it to the App date", () => {
      const parserFormatter: NgbDateAppParserFormatter = new NgbDateAppParserFormatter(new AppDatePipe());
      parserFormatter.locale = "en";
      const date: NgbDateStruct = { day: 1, month: 5, year: 2019 };
      const result: string = parserFormatter.format(date);
      expect(result).toBe("01-MAY-2019");
    });

    it("Can take an NgbDateStruct and format it to the App date for a different language", () => {
      const parserFormatter: NgbDateAppParserFormatter = new NgbDateAppParserFormatter(new AppDatePipe());
      parserFormatter.locale = "fr-fr";
      const date: NgbDateStruct = { day: 1, month: 5, year: 2019 };
      const result: string = parserFormatter.format(date);
      expect(result).toBe("01-MAI-2019");
    });
  });
});
