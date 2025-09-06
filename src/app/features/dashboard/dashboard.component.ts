import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DialogService } from "primeng/dynamicdialog";
import { AuthenticationService } from "../authentication/services/authentication.service";
import { Appointment } from "../appointments/models/appointment";
import { AppointmentService } from "../appointments/services/appointment.service";
import { AppointmentsListComponent } from "../appointments/components/appointments-list/appointments-list.component";
import { AppointmentsStatus } from "../../shared/data-transfer-objects/appointments-status";
import { Roles } from "../../constants/roles";
import { AppointmentsRequestsListComponent } from "../appointments/appointment-requests/components/appointments-requests-list/appointments-requests-list.component";
import { AppointmentRequestService } from "../appointments/appointment-requests/services/appointment-request.service";
import { AppointmentRequest } from "../appointments/appointment-requests/models/appointment-request";
import { HelperService } from "../../shared/services/helper.service";
import { Button } from "primeng/button";
import { MessageService } from "primeng/api";
import { RecurringAppointmentService } from "../appointments/recurring-appointments/services/recurring-appointment.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    AppointmentsListComponent,
    AppointmentsRequestsListComponent,
    Button,
  ],
  providers: [DialogService],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent {
  approvedAppointments!: Appointment[];
  pendingAppointments!: Appointment[];
  inProgressAppointments!: Appointment[];

  appointmentRequests!: AppointmentRequest[];

  userRole!: string;

  get userRoles(): typeof Roles {
    return Roles;
  }

  constructor(
    private authenticationService: AuthenticationService,
    private appointmentRequestService: AppointmentRequestService,
    private appointmentService: AppointmentService,
    private recurringAppointmentService: RecurringAppointmentService,
    private messageService: MessageService,
    private helperService: HelperService,
  ) {
    this.loadData();
    this.getDataStatus();
  }

  generateRecurringAppointments(): void {
    this.recurringAppointmentService
      .generateNextWeekRecurringAppointments()
      .subscribe({
        next: (data: boolean) => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Appointments are successfully generated.",
          });

          this.loadData();
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  private getDataStatus() {
    this.helperService.getDataStatus().subscribe((data) => {
      this.loadData();
    });
  }

  private loadData(): void {
    this.userRole = this.authenticationService.getUserRole();
    this.loadAppointmentRequests();
    this.loadAppointments();
  }

  private loadAppointmentRequests() {
    this.appointmentRequestService.getPendingAppointmentRequests().subscribe({
      next: (data: AppointmentRequest[]) => {
        if(data){
          this.appointmentRequests = data.map((x: AppointmentRequest) =>
              Object.assign(new AppointmentRequest(), x),
          );
        } else {
          this.appointmentRequests = [];
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  private loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (data: AppointmentsStatus) => {
        this.approvedAppointments = data.approvedAppointments.map(
          (x: Appointment) => Object.assign(new Appointment(), x),
        );

        this.pendingAppointments = data.pendingAppointments.map(
          (x: Appointment) => Object.assign(new Appointment(), x),
        );

        this.inProgressAppointments = data.inProgressAppointments.map(
          (x: Appointment) => Object.assign(new Appointment(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
