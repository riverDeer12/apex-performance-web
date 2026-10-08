import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient, HttpParams } from "@angular/common/http";
import { RouterLink } from "@angular/router";
import { Select } from "primeng/select";
import { environment } from "../../../../../environments/environment";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { TodayAppointment, TodayOverview } from "./today-overview";

// Longer lists are cut, the rest is shown as "and N more".
const LIST_LIMIT = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

type AppointmentState = "past" | "current" | "next" | "upcoming";

/**
 * Overview of the day for coaches and administrators: key numbers
 * on top, then today's appointments as a timeline, pending requests,
 * clients with low credits, inactive clients and monthly reviews.
 */
@Component({
    selector: "app-today-overview",
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, Select, TranslatePipe],
    templateUrl: "./today-overview.component.html",
    styleUrl: "./today-overview.component.scss",
})
export class TodayOverviewComponent implements OnInit {
    overview: TodayOverview | null = null;

    inactiveDays = 14;

    readonly listLimit = LIST_LIMIT;

    readonly inactiveDaysOptions = [7, 14, 30, 60].map(days => ({ label: `${days}`, value: days }));

    // Appointment states are calculated once per load, not on every change detection.
    appointmentStates = new Map<string, AppointmentState>();

    constructor(
        private http: HttpClient,
        private translationService: TranslationService,
    ) {
        try {
            const saved = Number(localStorage.getItem("inactiveDays"));
            if (saved > 0) this.inactiveDays = saved;
        } catch {
        }
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        try {
            localStorage.setItem("inactiveDays", String(this.inactiveDays));
        } catch {
        }

        this.http.get<TodayOverview>(environment.apiUrl + "/dashboard/today", {
            params: new HttpParams().set("inactiveDays", this.inactiveDays),
        }).subscribe(overview => {
            this.overview = overview;
            this.appointmentStates = this.calculateStates(overview.todayAppointments);
        });
    }

    get locale(): string {
        return this.translationService.language() === "hr" ? "hr-HR" : "en-GB";
    }

    get todayLabel(): string {
        return new Date().toLocaleDateString(this.locale, { weekday: "long", day: "numeric", month: "long" });
    }

    get pendingTotal(): number {
        const pending = this.overview?.pendingRequests;
        return pending ? pending.appointments + pending.cancelationRequests + pending.joinRequests : 0;
    }

    get remainingAppointments(): number {
        return [...this.appointmentStates.values()].filter(x => x !== "past").length;
    }

    get monthName(): string {
        const reviews = this.overview?.monthlyReviews;
        return reviews
            ? new Date(reviews.year, reviews.month - 1, 1).toLocaleDateString(this.locale, { month: "long" })
            : "";
    }

    // Reviews are written by the last day of the month (before the 1st of the next one).
    get reviewDueDate(): Date | null {
        const reviews = this.overview?.monthlyReviews;
        return reviews ? new Date(reviews.year, reviews.month, 0) : null;
    }

    get reviewDaysLeft(): number {
        const due = this.reviewDueDate;
        if (!due) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Math.max(Math.round((due.getTime() - today.getTime()) / DAY_MS), 0);
    }

    get reviewsWritten(): number {
        const reviews = this.overview?.monthlyReviews;
        return reviews ? Math.max(reviews.totalClients - reviews.missingClients.length, 0) : 0;
    }

    get reviewsPercent(): number {
        const total = this.overview?.monthlyReviews?.totalClients ?? 0;
        return total ? Math.round(this.reviewsWritten / total * 100) : 100;
    }

    // Reviews are urgent in the last week of the month when some are missing.
    get reviewsUrgent(): boolean {
        return !!this.overview?.monthlyReviews.missingClients.length && this.reviewDaysLeft <= 7;
    }

    initials(fullName: string): string {
        return fullName.split(" ").filter(x => !!x).slice(0, 2).map(x => x[0].toUpperCase()).join("");
    }

    daysAgo(date: string | null): string {
        if (!date) return this.translationService.t("today.never");

        const days = Math.floor((Date.now() - new Date(date).getTime()) / DAY_MS);

        return this.translationService.t("today.daysAgo").replace("{count}", String(days));
    }

    more(count: number): string {
        return this.translationService.t("today.andMore").replace("{count}", String(count - LIST_LIMIT));
    }

    scrollTo(id: string): void {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Past appointments are dimmed, the first one that has not started is marked as next.
    private calculateStates(appointments: TodayAppointment[]): Map<string, AppointmentState> {
        const now = Date.now();
        const states = new Map<string, AppointmentState>();
        let nextFound = false;

        for (const appointment of appointments) {
            const start = new Date(appointment.startTime).getTime();
            const end = new Date(appointment.endTime).getTime();

            if (end <= now) {
                states.set(appointment.id, "past");
            } else if (start <= now || appointment.status === "InProgress") {
                states.set(appointment.id, "current");
            } else if (!nextFound) {
                states.set(appointment.id, "next");
                nextFound = true;
            } else {
                states.set(appointment.id, "upcoming");
            }
        }

        return states;
    }
}
