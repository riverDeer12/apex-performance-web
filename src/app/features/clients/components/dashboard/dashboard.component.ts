import { Component, OnInit } from "@angular/core";
import { Appointment } from "../../../appointments/models/appointment";
import { AppointmentService } from "../../../appointments/services/appointment.service";
import { Button } from "primeng/button";
import { CommonModule, DatePipe } from "@angular/common";
import { DialogFormComponent } from "../../../../components/dialog-form/dialog-form.component";
import { EntityType } from "../../../../enums/entity-type";
import { ActionType } from "../../../../enums/action-type";
import { DialogService } from "primeng/dynamicdialog";
import { Divider } from "primeng/divider";
import { AuthenticationService } from "../../../authentication/services/authentication.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, Button, DatePipe, Divider],
  providers: [DialogService],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  appointments!: Appointment[];

  isAdmin!: boolean;

  constructor(
    private appointmentService: AppointmentService,
    private authenticationService: AuthenticationService,
    private dialogService: DialogService,
  ) {
    this.isAdmin = this.authenticationService.validateAdminUser();
  }

  ngOnInit() {
    return this.isAdmin ? null : this.loadData();
  }

  private loadData() {
    this.appointmentService.getAppointmentsByClient().subscribe({
      next: (data: Appointment[]) => {
        this.appointments = data.map((x: Appointment) =>
          Object.assign(new Appointment(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  openUpdateDialog(appointment: Appointment) {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: "Update data for: " + appointment.startTime,
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
}
