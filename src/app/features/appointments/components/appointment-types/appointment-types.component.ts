import { Component, OnInit } from "@angular/core";
import { DialogService } from "primeng/dynamicdialog";
import { DialogFormComponent } from "../../../../components/dialog-form/dialog-form.component";
import { EntityType } from "../../../../enums/entity-type";
import { ActionType } from "../../../../enums/action-type";
import { AppointmentType } from "../../models/appointment-type";
import { AppointmentTypeService } from "../../services/appointment-type.service";
import { Button } from "primeng/button";
import { TableModule } from "primeng/table";
import { DialogInfoComponent } from "../../../../components/dialog-info/dialog-info.component";
import { ConfirmationService, MessageService } from "primeng/api";

@Component({
  selector: "app-appointment-types",
  imports: [Button, TableModule],
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
      header: "Add New Appointment Type",
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
      header: "Details for: " + appointmentType.id,
      data: {
        contentType: EntityType.AppointmentType,
        data: appointmentType,
      },
    });
  }

  openUpdateDialog(appointmentType: AppointmentType) {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: "Update data for: " + appointmentType.id,
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
      message:
        "Are you sure that you want to deactivate this Appointment Type?",
      header: "Confirm deletion of " + appointmentType.id,
      closable: true,
      closeOnEscape: true,
      icon: "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: "No",
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: "Yes",
      },
      accept: () => {
        this.appointmentTypeService
          .deleteAppointmentType(appointmentType.id)
          .subscribe(
            (response) => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Appointment Type has been deactivated.",
              });
            },
            (error) => {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Error deactivating Appointment Type.",
              });
            },
          );
      },
    });
  }
}
