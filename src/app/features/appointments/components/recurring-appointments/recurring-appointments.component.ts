import { Component, OnInit } from "@angular/core";
import { Button } from "primeng/button";
import { DatePipe, NgIf } from "@angular/common";
import { TableModule } from "primeng/table";
import { RecurringAppointment } from "../../models/recurring-appointment";
import { Roles } from '../../../../constants/roles';
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { RecurringAppointmentService } from "../../services/recurring-appointment.service";
import { Permissions } from '../../../../constants/permissions';
import { DialogFormComponent } from '../../../../components/dialog-form/dialog-form.component';
import { EntityType } from '../../../../enums/entity-type';
import { ActionType } from '../../../../enums/action-type';
import { DialogService } from "primeng/dynamicdialog";

@Component({
  selector: "app-recurring-appointments",
  imports: [Button, DatePipe, NgIf, TableModule],
  providers: [DialogService],
  templateUrl: "./recurring-appointments.component.html",
  styleUrl: "./recurring-appointments.component.scss",
})
export class RecurringAppointmentsComponent implements OnInit {
  recurringAppointments!: RecurringAppointment[];

  userRole!: string;

  get userCanCreateRecurringAppointment(): boolean {
    return this.authenticationService.checkPermission(
        Permissions.CanCreateRecurringAppointment
    );
  }

  constructor(private authenticationService: AuthenticationService,
              private recurringAppointmentService: RecurringAppointmentService,
              private dialogService: DialogService) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit(){
    this.loadData();
  }

  private loadData(): void {
    if (this.userRole == Roles.Administrator) {
      this.loadAdminRecurringAppointments();
    } else if (this.userRole == Roles.Coach) {
      this.loadCoachRecurringAppointments();
    } else if (this.userRole == Roles.Client) {
      this.loadClientRecurringAppointments();
    }
  }

  loadAdminRecurringAppointments(): void {
    this.recurringAppointmentService.getAllRecurringAppointments().subscribe({
      next: (data: RecurringAppointment[]) => {
        this.recurringAppointments = data.map((x: RecurringAppointment) =>
            Object.assign(new RecurringAppointment(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  loadCoachRecurringAppointments(): void {
    this.recurringAppointmentService.getCoachRecurringAppointments().subscribe({
      next: (data: RecurringAppointment[]) => {
        this.recurringAppointments = data.map((x: RecurringAppointment) =>
            Object.assign(new RecurringAppointment(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  loadClientRecurringAppointments(): void {
    this.recurringAppointmentService.getClientRecurringAppointments().subscribe({
      next: (data: RecurringAppointment[]) => {
        this.recurringAppointments = data.map((x: RecurringAppointment) =>
            Object.assign(new RecurringAppointment(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: "Add New Recurring Appointment",
      data: {
        contentType: EntityType.RecurringAppointment,
        formType: ActionType.Create,
        dialogId: "createRecurringAppointmentForm",
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }
}
