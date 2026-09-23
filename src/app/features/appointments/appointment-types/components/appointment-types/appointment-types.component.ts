import { Component, OnInit } from "@angular/core";
import { DialogService } from "primeng/dynamicdialog";
import { DialogFormComponent } from "../../../../../shared/components/dialog-form/dialog-form.component";
import { EntityType } from "../../../../../enums/entity-type";
import { ActionType } from "../../../../../enums/action-type";
import { AppointmentType } from "../../models/appointment-type";
import { AppointmentTypeService } from "../../services/appointment-type.service";
import { Button } from "primeng/button";
import { TableModule } from "primeng/table";
import { DialogInfoComponent } from "../../../../../shared/components/dialog-info/dialog-info.component";
import { ConfirmationService, MessageService } from "primeng/api";
import { TranslationService } from "../../../../../i18n/translation.service";
import { TranslatePipe } from "../../../../../i18n/translate.pipe";

@Component({
  selector: "app-appointment-types",
  imports: [Button, TableModule, TranslatePipe],
  providers: [DialogService],
  templateUrl: "./appointment-types.component.html",
  styleUrl: "./appointment-types.component.scss",
})
export class AppointmentTypesComponent implements OnInit {
  appointmentTypes!: AppointmentType[];

  constructor(
    private appointmentTypeService: AppointmentTypeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private translationService: TranslationService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData(): void {
    this.appointmentTypeService.getAllAppointmentTypes().subscribe({
      next: (data) => {
        this.appointmentTypes = data.map((x: AppointmentType) =>
          Object.assign(new AppointmentType(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: this.translationService.t("appointmentTypes.addNew"),
      data: {
        contentType: EntityType.AppointmentType,
        formType: ActionType.Create,
        dialogId: "createAppointmentTypeForm",
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  openInfoDialog(appointmentType: AppointmentType) {
    this.dialogService.open(DialogInfoComponent, {
      header: this.translationService.t("appointmentTypes.detailsFor") + " " + appointmentType.name,
      data: {
        contentType: EntityType.AppointmentType,
        data: appointmentType,
      },
    });
  }

  openUpdateDialog(appointmentType: AppointmentType) {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: this.translationService.t("appointmentTypes.updateDataFor") + " " + appointmentType.name,
      data: {
        contentType: EntityType.AppointmentType,
        formType: ActionType.Update,
        dialogId: "updateAppointmentTypeForm",
        data: appointmentType,
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  confirmDelete(appointmentType: AppointmentType) {
    this.confirmationService.confirm({
      message: this.translationService.t("appointmentTypes.confirmDeactivate"),
      header: this.translationService.t("common.confirmDeletionHeader") + " " + appointmentType.id,
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
        this.appointmentTypeService
          .deleteAppointmentType(appointmentType.id)
          .subscribe(
            (response) => {
              this.messageService.add({
                severity: "success",
                summary: this.translationService.t("common.success"),
                detail: this.translationService.t("appointmentTypes.deactivatedDetail"),
              });

              this.loadData();

            },
            (error) => {
              this.messageService.add({
                severity: "error",
                summary: this.translationService.t("common.error"),
                detail: this.translationService.t("appointmentTypes.deactivateErrorDetail"),
              });
            },
          );
      },
    });
  }
}
