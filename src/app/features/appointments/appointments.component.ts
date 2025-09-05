import { Component, OnInit } from "@angular/core";
import { AppointmentService } from "./services/appointment.service";
import { Appointment } from "./models/appointment";
import { Button } from "primeng/button";
import { DialogFormComponent } from "../../components/dialog-form/dialog-form.component";
import { EntityType } from "../../enums/entity-type";
import { ActionType } from "../../enums/action-type";
import { DialogService } from "primeng/dynamicdialog";
import { CommonModule, DatePipe, formatDate } from "@angular/common";
import { ConfirmationService, MessageService } from "primeng/api";
import { TableModule } from "primeng/table";
import { DialogInfoComponent } from "../../components/dialog-info/dialog-info.component";
import { BusinessStatuses } from "../../constants/business-statuses";
import { Roles } from "../../constants/roles";
import { AuthenticationService } from "../authentication/services/authentication.service";
import { AppointmentsStatus } from "../../shared/data-transfer-objects/appointments-status";
import { Permissions } from "../../constants/permissions";
import { DateExtensions } from "../../shared/extensions/date-extensions";

@Component({
  selector: "app-appointments",
  standalone: true,
  imports: [CommonModule, Button, DatePipe, TableModule],
  providers: [DialogService],
  templateUrl: "./appointments.component.html",
  styleUrl: "./appointments.component.scss",
})
export class AppointmentsComponent implements OnInit {
  userRole!: string;

  appointments!: Appointment[];

  weekDays = DateExtensions.getWeekDates(new Date(), 1);

  get userCanCreateAppointment(): boolean {
    return this.authenticationService.checkPermission(
      Permissions.CanCreateAppointment,
    );
  }

  get userRoles(): typeof Roles {
    return Roles;
  }

  constructor(
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private dialogService: DialogService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit() {
    this.loadData();
  }

  private loadData(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (data: AppointmentsStatus) => {
        this.appointments = data.approvedAppointments.map((x: Appointment) =>
          Object.assign(new Appointment(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  areActionsEnabled = (appointment: Appointment) =>
    (this.userRole == Roles.Administrator &&
      appointment.status.name == BusinessStatuses.Pending) ||
    appointment.status.name == BusinessStatuses.InProgress;

  isStatusTextVisible = (appointment: Appointment) =>
    this.userRole == Roles.Administrator &&
    appointment.status.name != BusinessStatuses.Pending &&
    appointment.status.name != BusinessStatuses.InProgress;

  getTextColor = (appointment: Appointment) => {
    switch (appointment.status.name) {
      case BusinessStatuses.Approved:
        return "text-green-500";
      case BusinessStatuses.Declined:
        return "text-red-500";
      case BusinessStatuses.Canceled:
        return "text-red-500";
      default:
        return "";
    }
  };

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

  openInfoDialog(appointment: Appointment) {
    this.dialogService.open(DialogInfoComponent, {
      header:
        "Details for: " +
        formatDate(appointment.startTime, "dd.MM.yyyy HH:mm", "en-US"),
      data: {
        contentType: EntityType.Appointment,
        data: appointment,
      },
    });
  }

  approve(appointment: Appointment): void {
    this.appointmentService.approveAppointment(appointment.id).subscribe({
      next: (data) => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Appointment has been approved.",
        });
        this.loadData();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  decline(appointment: Appointment): void {
    this.appointmentService.declineAppointment(appointment.id).subscribe({
      next: (data) => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Appointment has been declined.",
        });
        this.loadData();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
