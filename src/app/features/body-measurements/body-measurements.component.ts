import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { Button, ButtonDirective } from "primeng/button";
import { CommonModule, DatePipe } from "@angular/common";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { Table, TableModule } from "primeng/table";
import { DialogService } from "primeng/dynamicdialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { HelperService } from "../../shared/services/helper.service";
import { DialogFormComponent } from "../../shared/components/dialog-form/dialog-form.component";
import { EntityType } from "../../enums/entity-type";
import { ActionType } from "../../enums/action-type";
import { DialogInfoComponent } from "../../shared/components/dialog-info/dialog-info.component";
import { BodyMeasurement } from "./models/body-measurement";
import { BodyMeasurementService } from "./services/body-measurement.service";
import { Roles } from "../../constants/roles";
import { AuthenticationService } from "../authentication/services/authentication.service";
import { TranslationService } from "../../i18n/translation.service";
import { TranslatePipe } from "../../i18n/translate.pipe";

@Component({
  selector: "app-body-measurements",
  imports: [
    CommonModule,
    Button,
    ButtonDirective,
    DatePipe,
    IconField,
    InputIcon,
    InputText,
    TableModule,
    TranslatePipe,
  ],
  providers: [DialogService],
  templateUrl: "./body-measurements.component.html",
  styleUrl: "./body-measurements.component.scss",
})
export class BodyMeasurementsComponent implements OnInit {
  @Input() bodyMeasurements!: BodyMeasurement[];

  @ViewChild(`filter`) filter!: ElementRef;

  userRole!: string;

  get userRoles(): typeof Roles {
    return Roles;
  }

  get canManageBodyMeasurements(): boolean {
    const loggedUserRole = this.authenticationService.getUserRole();

    return (
      loggedUserRole == Roles.Administrator || loggedUserRole == Roles.Coach
    );
  }

  constructor(
    private bodyMeasurementService: BodyMeasurementService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private helperService: HelperService,
    private confirmationService: ConfirmationService,
    private authenticationService: AuthenticationService,
    private translationService: TranslationService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit(): void {
    this.loadData();
    this.getDataStatus();
  }

  private loadData(): void {
    this.bodyMeasurementService
      .getBodyMeasurements()
      .subscribe((response: BodyMeasurement[]) => {
        this.bodyMeasurements = response.map((x: BodyMeasurement) =>
          Object.assign(new BodyMeasurement(), x),
        );
      });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = "";
  }

  openCreateDialog() {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: this.translationService.t("bodyMeasurements.addNew"),
      data: {
        contentType: EntityType.BodyMeasurement,
        formType: ActionType.Create,
        dialogId: "createBodyMeasurementForm",
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  openInfoDialog(bodyMeasurement: BodyMeasurement) {
    this.dialogService.open(DialogInfoComponent, {
      header: this.translationService.t("bodyMeasurements.detailsFor") + " " + bodyMeasurement.id,
      data: {
        contentType: EntityType.BodyMeasurement,
        data: bodyMeasurement,
      },
    });
  }

  openUpdateDialog(bodyMeasurement: BodyMeasurement) {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: this.translationService.t("bodyMeasurements.updateDataFor") + " " + bodyMeasurement.id,
      data: {
        contentType: EntityType.BodyMeasurement,
        formType: ActionType.Update,
        dialogId: "updateBodyMeasurementForm",
        data: bodyMeasurement,
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  confirmDelete(bodyMeasurement: BodyMeasurement) {
    this.confirmationService.confirm({
      message: this.translationService.t("bodyMeasurements.confirmDeactivate"),
      header: this.translationService.t("common.confirmDeletionHeader") + " " + bodyMeasurement.id,
      closable: true,
      closeOnEscape: true,
      icon: "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: this.translationService.t("common.no"),
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: this.translationService.t("common.yes"),
      },
      accept: () => {
        this.bodyMeasurementService
          .deleteBodyMeasurement(bodyMeasurement.id)
          .subscribe(
            (response) => {
              this.messageService.add({
                severity: "success",
                summary: this.translationService.t("common.success"),
                detail: this.translationService.t("bodyMeasurements.deactivatedDetail"),
              });

              this.loadData();

            },
            (error) => {
              this.messageService.add({
                severity: "error",
                summary: this.translationService.t("common.error"),
                detail: this.translationService.t("bodyMeasurements.deactivateErrorDetail"),
              });
            },
          );
      },
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
