import { Component, OnInit } from "@angular/core";
import { AppointmentService } from "./services/appointment.service";
import { Appointment } from "./models/appointment";
import { Button } from "primeng/button";
import { DialogFormComponent } from "../../shared/components/dialog-form/dialog-form.component";
import { EntityType } from "../../enums/entity-type";
import { ActionType } from "../../enums/action-type";
import { DialogService } from "primeng/dynamicdialog";
import { CommonModule, DatePipe, formatDate } from "@angular/common";
import { TableModule } from "primeng/table";
import { DialogInfoComponent } from "../../shared/components/dialog-info/dialog-info.component";
import { Roles } from "../../constants/roles";
import { AuthenticationService } from "../authentication/services/authentication.service";
import { Permissions } from "../../constants/permissions";

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
    private authenticationService: AuthenticationService,
    private dialogService: DialogService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit() {
    this.loadData();
  }

  private loadData(): void {
    this.appointmentService.getAllAppointments().subscribe({
      next: (data: Appointment[]) => {
        if (data) {
          this.appointments = data.map((x: Appointment) =>
            Object.assign(new Appointment(), x),
          );
        }
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
}
