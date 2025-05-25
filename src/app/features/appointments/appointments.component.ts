import { Component, OnInit } from "@angular/core";
import { Timeline } from "primeng/timeline";
import { AppointmentService } from "./services/appointment.service";
import { Appointment } from "./models/appointment";
import { Button } from "primeng/button";
import { DialogFormComponent } from "../../components/dialog-form/dialog-form.component";
import { EntityType } from "../../enums/entity-type";
import { ActionType } from "../../enums/action-type";
import { DialogService } from "primeng/dynamicdialog";
import { DatePipe, formatDate, NgForOf } from "@angular/common";
import { AppointmentsByDay } from "./models/appointments-by-day";
import { Divider } from "primeng/divider";
import { ConfirmationService, MessageService } from "primeng/api";

@Component({
  selector: "app-appointments",
  standalone: true,
  imports: [Timeline, Button, NgForOf, DatePipe, Divider],
  providers: [DialogService],
  templateUrl: "./appointments.component.html",
  styleUrl: "./appointments.component.scss",
})
export class AppointmentsComponent implements OnInit {
  appointmentsByDay!: AppointmentsByDay[];

  constructor(
    private appointmentService: AppointmentService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private dialogService: DialogService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData(): void {
    this.appointmentService.getAllAppointments().subscribe({
      next: (data: AppointmentsByDay[]) => {
        this.appointmentsByDay = data.map((x: AppointmentsByDay) =>
          Object.assign(new AppointmentsByDay(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: "Add New Appointment",
      data: {
        contentType: EntityType.Appointment,
        formType: ActionType.Create,
        dialogId: "createAppointmentForm",
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  openUpdateDialog(appointment: Appointment) {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header:
        "Update data for: " +
        formatDate(appointment.startTime, "dd.MM.yyyy HH:mm", "en-US"),
      data: {
        contentType: EntityType.Appointment,
        formType: ActionType.Update,
        dialogId: "updateAppointmentForm",
        data: appointment,
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  confirmDelete(appointment: Appointment) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to deactivate this appointment?',
      header: 'Confirm deletion of ' + formatDate(appointment.startTime, "dd.MM.yyyy HH:mm", "en-US"),
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'No',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Yes',
      },
      accept: () => {
        this.appointmentService.deleteAppointment(appointment.id)
            .subscribe((response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Appointment has been deactivated.'
              });
            }, error => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error deactivating appointment.'
              });
            });
      }
    });
  }

}
