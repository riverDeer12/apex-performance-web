import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient, HttpParams } from "@angular/common/http";
import { RouterLink } from "@angular/router";
import { Select } from "primeng/select";
import { Tag } from "primeng/tag";
import { environment } from "../../../../../environments/environment";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { TodayOverview } from "./today-overview";

// Longer lists are cut, the rest is shown as "and N more".
const LIST_LIMIT = 6;

/**
 * Overview of the day for coaches and administrators: today's
 * appointments, pending requests, clients with low credits,
 * inactive clients and monthly reviews still to be written.
 */
@Component({
    selector: "app-today-overview",
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, Select, Tag, TranslatePipe],
    templateUrl: "./today-overview.component.html",
    styleUrl: "./today-overview.component.scss",
})
export class TodayOverviewComponent implements OnInit {
    overview: TodayOverview | null = null;

    inactiveDays = 14;

    readonly listLimit = LIST_LIMIT;

    readonly inactiveDaysOptions = [7, 14, 30, 60].map(days => ({ label: `${days}`, value: days }));

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
        }).subscribe(overview => this.overview = overview);
    }

    get pendingTotal(): number {
        const pending = this.overview?.pendingRequests;
        return pending ? pending.appointments + pending.cancelationRequests + pending.joinRequests : 0;
    }

    get monthName(): string {
        const reviews = this.overview?.monthlyReviews;
        if (!reviews) return "";

        const locale = this.translationService.language() === "hr" ? "hr-HR" : "en-GB";

        return new Date(reviews.year, reviews.month - 1, 1).toLocaleDateString(locale, { month: "long" });
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

        return Math.max(Math.round((due.getTime() - today.getTime()) / 86400000), 0);
    }

    more(count: number): string {
        return this.translationService.t("today.andMore").replace("{count}", String(count - LIST_LIMIT));
    }
}
