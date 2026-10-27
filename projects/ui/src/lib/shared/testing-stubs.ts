/* eslint-disable @angular-eslint/component-selector */
import { Component, Input } from "@angular/core";

@Component({ selector: "fa-icon", template: "<span></span>" })
export class FaIconStubComponent {
  @Input() public icon: any;
  @Input() public fixedWidth: boolean;
}

@Component({ selector: "fa-layers", template: "<ng-content></ng-content>" })
export class FaLayersStubComponent {}
