import { Component, Input, OnInit } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { Appointment } from "../../models/appointment";
import { BusinessStatuses } from "../../../../constants/business-statuses";
import { DialogFormComponent } from "../../../../shared/components/dialog-form/dialog-form.component";
import { EntityType } from "../../../../enums/entity-type";
import { ActionType } from "../../../../enums/action-type";
import { DialogService } from "primeng/dynamicdialog";
import { TableModule } from "primeng/table";
import { Button, ButtonDirective } from 'primeng/button';
import { AppointmentService } from "../../services/appointment.service";
import { MessageService } from "primeng/api";
import { HelperService } from "../../../../shared/services/helper.service";
import { Roles } from "../../../../constants/roles";
import { DayOfWeek } from "../../../../enums/day-of-week";
import { AuthenticationService } from "../../../authentication/services/authentication.service";

@Component({
  selector: "app-appointments-list",
  imports: [CommonModule, DatePipe, TableModule, ButtonDirective, Button],
  providers: [DialogService],
  templateUrl: "./appointments-list.component.html",
  styleUrl: "./appointments-list.component.scss",
})
export class AppointmentsListComponent implements OnInit {
  @Input() type!: string;
  @Input() userRole!: string;
  @Input() appointments!: Appointment[];

  get userRoles(): typeof Roles {
    return Roles;
  }

  constructor(
    private dialogService: DialogService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private helperService: HelperService,
    private appointmentService: AppointmentService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit() {}

  get businessStatuses(): typeof BusinessStatuses {
    return BusinessStatuses;
  }

  get weekDays(): typeof DayOfWeek {
    return DayOfWeek;
  }

  isAppointmentCompleted = (appointment: Appointment) =>
      !this.isAppointmentActive(appointment) && appointment.status.name !== BusinessStatuses.Pending

  isAppointmentActive(appointment: Appointment): boolean {
    const isApprovedAppointment =
      appointment.status.name === BusinessStatuses.Approved;
    const isValidAppointmentTime =
      new Date(appointment.startTime).getTime() > new Date().getTime();
    return isApprovedAppointment && isValidAppointmentTime;
  }

  showPendingActionButtons = (appointment: Appointment): boolean =>
    appointment.status.name === BusinessStatuses.Pending &&
    (this.userRole === Roles.Administrator || this.userRole === Roles.Coach);

  showApproveActionButtons = (appointment: Appointment): boolean =>
    appointment.status.name === BusinessStatuses.Pending &&
    (this.userRole === Roles.Administrator || this.userRole === Roles.Coach);

  approve(appointment: Appointment): void {
    this.appointmentService.approveAppointment(appointment.id).subscribe({
      next: (data) => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Appointment has been approved.",
        });
        this.helperService.triggerDataRefresh(true);
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
        this.helperService.triggerDataRefresh(true);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  cancel(appointment: Appointment): void {
    if (this.userRole == Roles.Client) {
      this.openCancelationRequestDialog(appointment.id);
      return;
    } else {
      this.appointmentService.cancelAppointment(appointment.id).subscribe({
        next: (data) => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Appointment has been canceled.",
          });
          this.helperService.triggerDataRefresh(true);
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  openCancelationRequestDialog(appointmentId: string): void {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: "Create Cancelation Request",
      data: {
        contentType: EntityType.CancelationRequest,
        formType: ActionType.Create,
        dialogId: "createCancelationRequestForm",
        data: appointmentId,
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.helperService.triggerDataRefresh(true);
    });
  }
}
