import { Component, OnInit } from "@angular/core";
import { Button } from "primeng/button";
import { CommonModule, NgIf } from "@angular/common";
import { TableModule } from "primeng/table";
import { RecurringAppointment } from "../../models/recurring-appointment";
import { Roles } from "../../../../../constants/roles";
import { AuthenticationService } from "../../../../authentication/services/authentication.service";
import { RecurringAppointmentService } from "../../services/recurring-appointment.service";
import { Permissions } from "../../../../../constants/permissions";
import { DialogFormComponent } from "../../../../../shared/components/dialog-form/dialog-form.component";
import { EntityType } from "../../../../../enums/entity-type";
import { ActionType } from "../../../../../enums/action-type";
import { DialogService } from "primeng/dynamicdialog";
import { DateExtensions } from "../../../../../shared/extensions/date-extensions";
import { TimeSlot } from "../../../../time-slots/models/time-slot";
import { TimeSlotService } from "../../../../time-slots/services/time-slot.service";
import { DayOfWeek } from "../../../../../enums/day-of-week";
import { ConfirmationService, MessageService } from "primeng/api";
import { TranslationService } from "../../../../../i18n/translation.service";
import { TranslatePipe } from "../../../../../i18n/translate.pipe";

@Component({
  selector: "app-recurring-appointments",
  imports: [CommonModule, Button, NgIf, TableModule, TranslatePipe],
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
    private translationService: TranslationService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit() {
    this.loadData();
  }

  private loadData(): void {
    this.recurringAppointmentService.getRecurringAppointments().subscribe({
      next: (data: RecurringAppointment[]) => {
        this.recurringAppointments = data.map((x: RecurringAppointment) =>
          Object.assign(new RecurringAppointment(), x),
        );

        if (this.userRole === Roles.Coach) {
          this.loadCoachTimeSlots();
        }
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

  openCreateDialog() {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: this.translationService.t("recurringAppointments.addNew"),
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

  openUpdateDialog(recurringAppointment: RecurringAppointment) {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: this.translationService.t("recurringAppointments.updateHeader"),
      data: {
        contentType: EntityType.RecurringAppointment,
        formType: ActionType.Update,
        dialogId: "updateRecurringAppointmentForm",
        data: recurringAppointment,
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  changeActivity(recurringAppointment: RecurringAppointment) {
    this.confirmationService.confirm({
      message: this.translationService.t("recurringAppointments.confirmActivityChange"),
      header:
        this.translationService.t("recurringAppointments.confirmActivityChangeHeader") + " " + recurringAppointment.timeSlot.name,
      closable: true,
      closeOnEscape: true,
      icon: "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: this.translationService.t("common.no"),
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: this.translationService.t("common.yes"),
      },
      accept: () => {
        this.recurringAppointmentService
          .changeClientRecurringAppointmentActivity(recurringAppointment.id)
          .subscribe(
            () => {
              this.messageService.add({
                severity: "success",
                summary: this.translationService.t("common.success"),
                detail: this.translationService.t("recurringAppointments.activityChangedDetail"),
              });

              this.loadData();
            },
            () => {
              this.messageService.add({
                severity: "error",
                summary: this.translationService.t("common.error"),
                detail: this.translationService.t("recurringAppointments.activityChangeErrorDetail"),
              });
            },
          );
      },
    });
  }
}
