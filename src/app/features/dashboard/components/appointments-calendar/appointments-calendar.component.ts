import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Appointment } from "../../../appointments/models/appointment";
import { DateExtensions } from "../../../../shared/extensions/date-extensions";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";

@Component({
  selector: "app-appointments-calendar",
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./appointments-calendar.component.html",
  styleUrl: "./appointments-calendar.component.scss",
})
export class AppointmentsCalendarComponent {
  @Input() appointments: Appointment[] = [];

  weekDates: Date[] = DateExtensions.getWeekDates();

  weekdayKeys = [
    "calendar.monday",
    "calendar.tuesday",
    "calendar.wednesday",
    "calendar.thursday",
    "calendar.friday",
    "calendar.saturday",
    "calendar.sunday",
  ];

  constructor(private translationService: TranslationService) {}

  weekdayKeyFor(date: Date): string {
    return this.weekdayKeys[(date.getDay() + 6) % 7];
  }

  appointmentsForDay(date: Date): Appointment[] {
    return (this.appointments ?? [])
      .filter((appointment) => this.isSameDay(new Date(appointment.startTime), date))
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
