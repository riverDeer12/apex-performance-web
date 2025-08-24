import { Component, OnInit } from "@angular/core";
import { Button } from "primeng/button";
import { CommonModule, NgIf } from "@angular/common";
import { TableModule } from "primeng/table";
import { RecurringAppointment } from "../../models/recurring-appointment";
import { Roles } from "../../../../constants/roles";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { RecurringAppointmentService } from "../../services/recurring-appointment.service";
import { Permissions } from "../../../../constants/permissions";
import { DialogFormComponent } from "../../../../components/dialog-form/dialog-form.component";
import { EntityType } from "../../../../enums/entity-type";
import { ActionType } from "../../../../enums/action-type";
import { DialogService } from "primeng/dynamicdialog";
import { DateExtensions } from "../../../../shared/extensions/date-extensions";
import { TimeSlot } from "../../../time-slots/models/time-slot";
import { TimeSlotService } from "../../../time-slots/services/time-slot.service";
import { DayOfWeek } from "../../../../enums/day-of-week";
import { ConfirmationService, MessageService } from "primeng/api";

@Component({
  selector: "app-recurring-appointments",
  imports: [CommonModule, Button, NgIf, TableModule],
  providers: [DialogService],
  templateUrl: "./recurring-appointments.component.html",
  styleUrl: "./recurring-appointments.component.scss",
})
export class RecurringAppointmentsComponent implements OnInit {
  recurringAppointments!: RecurringAppointment[];

  timeSlots!: TimeSlot[];

  userRole!: string;

  weekDays = DateExtensions.getWeekDays(DayOfWeek.Monday);

  get userCanCreateRecurringAppointment(): boolean {
    return this.authenticationService.checkPermission(
      Permissions.CanCreateRecurringAppointment,
    );
  }

  get userRoles(): typeof Roles {
    return Roles;
  }

  constructor(
    private authenticationService: AuthenticationService,
    private timeSlotService: TimeSlotService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private recurringAppointmentService: RecurringAppointmentService,
    private dialogService: DialogService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit() {
    this.loadData();
  }

  recurringAppointmentArranged(timeSlot: TimeSlot): boolean {
    return this.recurringAppointments.some(
      (a: { timeSlot: { id: string } }) => a.timeSlot?.id === timeSlot.id,
    );
  }

  showClientForRecurringAppointment(timeSlot: TimeSlot): string {
    let recurringAppointment = this.recurringAppointments.find(
      (a) => a.timeSlot?.id === timeSlot.id,
    );

    return (
      recurringAppointment?.client.firstName +
      "" +
      recurringAppointment?.client.lastName
    );
  }

  private loadData(): void {
    if (this.userRole == Roles.Administrator) {
      this.loadAdminRecurringAppointments();
    } else if (this.userRole == Roles.Coach) {
      this.loadCoachRecurringAppointments();
      this.loadCoachTimeSlots();
    } else if (this.userRole == Roles.Client) {
      this.loadClientRecurringAppointments();
    }
  }

  private loadAdminRecurringAppointments(): void {
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

  private loadCoachRecurringAppointments(): void {
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

  private loadCoachTimeSlots(): void {
    this.timeSlotService.getCoachTimeSlots().subscribe({
      next: (data: TimeSlot[]) => {
        this.timeSlots = data.map((x: TimeSlot) =>
          Object.assign(new TimeSlot(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  private loadClientRecurringAppointments(): void {
    this.recurringAppointmentService
      .getClientRecurringAppointments()
      .subscribe({
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

  changeActivity(recurringAppointment: RecurringAppointment) {
    this.confirmationService.confirm({
      message: "Are you sure that you want to change activity for this recurring appointment?",
      header: "Confirm activity change of " + recurringAppointment.timeSlot.name,
      closable: true,
      closeOnEscape: true,
      icon: "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: "No",
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: "Yes",
      },
      accept: () => {
        this.recurringAppointmentService.changeClientRecurringAppointmentActivity(recurringAppointment.id).subscribe(
            () => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Recurring Appointment activity has been changed.",
              });

              this.loadData();

            },
            () => {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Error changing Recurring Appointment activity.",
              });
            },
        );
      },
    });
  }
}
