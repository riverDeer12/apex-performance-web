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
import { TranslationService } from "../../../../../i18n/translation.service";
import { TranslatePipe } from "../../../../../i18n/translate.pipe";

@Component({
  selector: "app-appointments-requests-list",
  imports: [CommonModule, Button, DatePipe, TableModule, TranslatePipe],
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
    private translationService: TranslationService,
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
            summary: this.translationService.t("common.success"),
            detail: this.translationService.t("appointmentRequests.approvedDetail"),
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
            summary: this.translationService.t("common.success"),
            detail: this.translationService.t("appointmentRequests.declinedDetail"),
          });

          this.helperService.triggerDataRefresh(true);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
