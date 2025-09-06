import { Component, Input } from "@angular/core";
import { AppointmentRequest } from "../../models/appointment-request";
import { Button } from "primeng/button";
import { CommonModule, DatePipe } from "@angular/common";
import { TableModule } from "primeng/table";
import { AppointmentRequestService } from "../../services/appointment-request.service";
import { MessageService } from "primeng/api";
import { HelperService } from "../../../../../shared/services/helper.service";
import { AuthenticationService } from "../../../../authentication/services/authentication.service";
import { Roles } from "../../../../../constants/roles";

@Component({
  selector: "app-appointments-requests-list",
  imports: [CommonModule, Button, DatePipe, TableModule],
  templateUrl: "./appointments-requests-list.component.html",
  styleUrl: "./appointments-requests-list.component.scss",
})
export class AppointmentsRequestsListComponent {
  @Input() appointmentRequests!: AppointmentRequest[];

  userRole!: string;

  get userRoles(): typeof Roles {
    return Roles;
  }

  get showActionButtons(): boolean {
    return this.userRole !== Roles.Client;
  }

  constructor(
    private appointmentRequestService: AppointmentRequestService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private helperService: HelperService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  approve(appointmentRequest: AppointmentRequest): void {
    this.appointmentRequestService
      .approveAppointmentRequest(appointmentRequest.id)
      .subscribe({
        next: (data) => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Appointment Request has been approved.",
          });

          this.helperService.triggerDataRefresh(true);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  decline(appointmentRequest: AppointmentRequest): void {
    this.appointmentRequestService
      .declineAppointmentRequest(appointmentRequest.id)
      .subscribe({
        next: (data) => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Appointment Request has been declined.",
          });

          this.helperService.triggerDataRefresh(true);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
