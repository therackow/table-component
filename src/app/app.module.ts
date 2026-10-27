import { DecimalPipe } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { UIModule } from "../../projects/ui/src/lib/ui.module";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FontAwesomeModule, NgbModule, UIModule, HttpClientModule],
  providers: [DecimalPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
