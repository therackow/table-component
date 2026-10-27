import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { AppTableConfig, TableData } from "projects/ui/src/lib/table/table-types";

interface Country {
  id: number;
  name: string;
  flag: string;
  area: number;
  population: number;
  g7: boolean;
  established: string;
  languages: string[];
  currency: string;
  gdpPerCapitaUSD: number;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  public config: AppTableConfig = {
    serverSide: true,
    url: "http://localhost:5000/data",
    expandableRows: true,
    selectableRows: true,
    tableName: "countries",
    stateSave: false,
    tableCaption: "Country statistics",
    tableSummary:
      "This table has 9 columns: name, flag, area, population, g7, established, languages, currency, and gdp per capita.",
    tableHeight: "475px",
    // groupRow: "continent"
  };

  public rowsSelected: boolean = false;
  public countryChoices$!: Observable<string[]>;
  public languageChoices$!: Observable<string[]>;

  public constructor(public httpClient: HttpClient) {}

  public ngOnInit(): void {
    this.countryChoices$ = this.getFilterData(this.config.url, "name");
    this.languageChoices$ = this.getFilterData(this.config.url, "languages");
  }

  public getFilterData(url: string, filterName: string): Observable<string[]> {
    const fullUrl: string = `${url}/filter?name=${filterName}`;

    return this.httpClient
      .get<{ data: string[] }>(fullUrl)
      .pipe(map((resp) => resp.data));
  }

  public onRowsSelected(rows: TableData<Country>[]): void {
    this.rowsSelected = rows.some((row) => row.selected);
  }
}
