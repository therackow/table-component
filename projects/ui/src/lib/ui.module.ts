import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule, NgbDateParserFormatter, NgbDatepickerI18n } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";

import { DatepickerComponent, NgbDateAppParserFormatter, AppDatepickerI18n } from "./datepicker/datepicker.component";
import { AppCurrencyPipe } from "./pipes/app-currency.pipe";
import { AppDatePipe } from "./pipes/app-date.pipe";
import { PadZeroPipe } from "./pipes/pad-zero.pipe";
import { DateFilterComponent } from "./table/table-filter/table-date-filter/table-date-filter.component";
import { AppTableFilterComponent } from "./table/table-filter/table-filter.component";
import { TableRowCheckboxComponent } from "./table/table-row-checkbox/table-row-checkbox.component";
import {
  TableComponent,
  AppTemplateDirective,
  HeaderConfigDirective,
  RowConfigDirective,
  SortableHeaderDirective,
} from "./table/table.component";
import { TriStateCheckboxComponent } from "./tri-state-checkbox/tri-state-checkbox.component";
import { UiComponent } from "./ui.component";

@NgModule({
  declarations: [
    UiComponent,
    AppCurrencyPipe,
    AppDatePipe,
    PadZeroPipe,
    DatepickerComponent,
    TableComponent,
    SortableHeaderDirective,
    HeaderConfigDirective,
    RowConfigDirective,
    DateFilterComponent,
    AppTableFilterComponent,
    TriStateCheckboxComponent,
    AppTemplateDirective,
    TableRowCheckboxComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    NgbModule,
    NgSelectModule,
    ReactiveFormsModule,
    RouterModule.forRoot([]),
  ],
  exports: [
    UiComponent,
    AppCurrencyPipe,
    AppDatePipe,
    PadZeroPipe,
    DatepickerComponent,
    TableComponent,
    SortableHeaderDirective,
    HeaderConfigDirective,
    RowConfigDirective,
    DateFilterComponent,
    AppTableFilterComponent,
    TriStateCheckboxComponent,
    AppTemplateDirective,
    TableRowCheckboxComponent,
  ],
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
    HttpClient,
  ],
})
export class UIModule {}
