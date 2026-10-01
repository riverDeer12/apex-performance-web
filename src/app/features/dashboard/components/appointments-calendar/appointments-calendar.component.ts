import { Component, Input, OnChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Appointment } from "../../../appointments/models/appointment";
import { OccupiedAppointment } from "../../../appointments/models/occupied-appointment";
import { DateExtensions } from "../../../../shared/extensions/date-extensions";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { Button } from "primeng/button";
import { DialogService } from "primeng/dynamicdialog";
import { MessageService } from "primeng/api";
import { AppointmentService } from "../../../appointments/services/appointment.service";
import { HelperService } from "../../../../shared/services/helper.service";
import { DialogFormComponent } from "../../../../shared/components/dialog-form/dialog-form.component";
import { EntityType } from "../../../../enums/entity-type";
import { ActionType } from "../../../../enums/action-type";
import { Roles } from "../../../../constants/roles";
import { BusinessStatuses } from "../../../../constants/business-statuses";

interface CalendarEntry {
  startTime: Date;
  endTime: Date;
  // Missing for occupied appointments of other clients.
  appointment?: Appointment;
}

@Component({
  selector: "app-appointments-calendar",
  standalone: true,
  imports: [CommonModule, TranslatePipe, Button],
  templateUrl: "./appointments-calendar.component.html",
  styleUrl: "./appointments-calendar.component.scss",
})
export class AppointmentsCalendarComponent implements OnChanges {
  @Input() appointments: Appointment[] = [];
  @Input() userRole!: string;
  // Appointments of other clients, shown to clients
  // only as occupied times without any details.
  @Input() occupiedAppointments: OccupiedAppointment[] = [];

  weekDates: Date[] = DateExtensions.getWeekDates();

  // Entries are built once per input change so the
  // template keeps the same objects between change
  // detection runs and buttons inside them stay clickable.
  entriesByDay: CalendarEntry[][] = this.weekDates.map(() => []);

  weekdayKeys = [
    "calendar.monday",
    "calendar.tuesday",
    "calendar.wednesday",
    "calendar.thursday",
    "calendar.friday",
    "calendar.saturday",
    "calendar.sunday",
  ];

  constructor(
    private translationService: TranslationService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private appointmentService: AppointmentService,
    private helperService: HelperService,
  ) {}

  canCancel(appointment: Appointment): boolean {
    return (
      appointment.status.name === BusinessStatuses.Approved &&
      new Date(appointment.startTime).getTime() > new Date().getTime()
    );
  }

  cancel(appointment: Appointment): void {
    if (this.userRole == Roles.Client) {
      this.openCancelationRequestDialog(appointment.id);
      return;
    }

    this.appointmentService.cancelAppointment(appointment.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: this.translationService.t("common.success"),
          detail: this.translationService.t("appointmentsList.canceledDetail"),
        });
        this.helperService.triggerDataRefresh(true);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  private openCancelationRequestDialog(appointmentId: string): void {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: this.translationService.t("appointmentsList.createCancelationRequest"),
      data: {
        contentType: EntityType.CancelationRequest,
        formType: ActionType.Create,
        dialogId: "createCancelationRequestForm",
        data: appointmentId,
      },
    });

    dialogRef.onClose.subscribe(() => {
      this.helperService.triggerDataRefresh(true);
    });
  }

  weekdayKeyFor(date: Date): string {
    return this.weekdayKeys[(date.getDay() + 6) % 7];
  }

  ngOnChanges(): void {
    this.entriesByDay = this.weekDates.map((date) => this.entriesForDay(date));
  }

  private entriesForDay(date: Date): CalendarEntry[] {
    const entries: CalendarEntry[] = [
      ...(this.appointments ?? []).map((appointment) => ({
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        appointment,
      })),
      ...(this.occupiedAppointments ?? []).map((occupied) => ({
        startTime: occupied.startTime,
        endTime: occupied.endTime,
      })),
    ];

    return entries
      .filter((entry) => this.isSameDay(new Date(entry.startTime), date))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }

  isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  clientNames(appointment: Appointment): string {
    return (appointment.clients ?? [])
      .map((client) => `${client.firstName} ${client.lastName}`)
      .join(", ");
  }

  coachNames(appointment: Appointment): string {
    return (appointment.coaches ?? [])
      .map((coach) => `${coach.firstName} ${coach.lastName}`)
      .join(", ");
  }

  formatTime(date: Date): string {
    const locale = this.translationService.language() === "en" ? "en-US" : "hr-HR";
    return new Date(date).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatDayDate(date: Date): string {
    const locale = this.translationService.language() === "en" ? "en-US" : "hr-HR";
    return date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}
