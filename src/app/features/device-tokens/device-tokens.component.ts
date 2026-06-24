import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { ButtonDirective } from "primeng/button";
import { DatePipe } from "@angular/common";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { Table, TableModule } from "primeng/table";
import { HelperService } from "../../shared/services/helper.service";
import { DeviceTokenService } from "./services/device-token.service";
import { DeviceToken } from "./core/device-token";

@Component({
  selector: "app-device-tokens",
  imports: [
    ButtonDirective,
    DatePipe,
    IconField,
    InputIcon,
    InputText,
    TableModule
  ],
  templateUrl: "./device-tokens.component.html",
  styleUrl: "./device-tokens.component.scss"
})
export class DeviceTokensComponent {
  @Input() deviceTokens!: DeviceToken[];

  @ViewChild(`filter`) filter!: ElementRef;

  constructor(
    private deviceTokenService: DeviceTokenService,
    private helperService: HelperService
  ) {
  }

  ngOnInit(): void {
    this.loadData();
    this.getDataStatus();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = "";
  }

  private loadData() {
    this.deviceTokenService
      .getDeviceTokens()
      .subscribe((response: DeviceToken[]) => {
        this.deviceTokens = response.map((x: DeviceToken) =>
          Object.assign(new DeviceToken(), x)
        );
      });
  }

  private getDataStatus() {
    this.helperService.getDataStatus().subscribe((response: boolean) => {
      if (response) {
        this.loadData();
      }
    });
  }
}
