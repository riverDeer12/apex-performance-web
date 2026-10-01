import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { ButtonDirective } from "primeng/button";
import { MessageService } from "primeng/api";
import { Appointment } from "../models/appointment";
import { AppointmentService } from "../services/appointment.service";
import { AppointmentsStatus } from "../../../shared/data-transfer-objects/appointments-status";
import { AuthenticationService } from "../../authentication/services/authentication.service";
import { Roles } from "../../../constants/roles";
import { TranslationService } from "../../../i18n/translation.service";
import { TranslatePipe } from "../../../i18n/translate.pipe";

/**
 * Appointments created by clients
 * that are waiting for approval.
 */
@Component({
  selector: "app-pending-appointments",
  standalone: true,
  imports: [CommonModule, TableModule, ButtonDirective, TranslatePipe],
  templateUrl: "./pending-appointments.component.html",
})
export class PendingAppointmentsComponent implements OnInit {
  appointments!: Appointment[];

  userRole: string;

  get userRoles(): typeof Roles {
    return Roles;
  }

  get canManage(): boolean {
    return this.userRole === Roles.Administrator || this.userRole === Roles.Coach;
  }

  constructor(
    private appointmentService: AppointmentService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private translationService: TranslationService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit(): void {
    this.loadData();
  }

  approve(appointment: Appointment): void {
    this.appointmentService.approveAppointment(appointment.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: this.translationService.t("common.success"),
          detail: this.translationService.t("appointmentsList.approvedDetail"),
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
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: this.translationService.t("common.success"),
          detail: this.translationService.t("appointmentsList.declinedDetail"),
        });
        this.loadData();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  private loadData(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (data: AppointmentsStatus) => {
        this.appointments = (data?.pendingAppointments ?? []).map((x: Appointment) =>
          Object.assign(new Appointment(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
