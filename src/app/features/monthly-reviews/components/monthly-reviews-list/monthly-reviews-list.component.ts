import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Card } from "primeng/card";
import { TranslationService } from "../../../../i18n/translation.service";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { MonthKeys, MonthlyReview } from "../../models/monthly-review";
import { MonthlyReviewService } from "../../services/monthly-review.service";

/**
 * Logged client's monthly reviews
 * written by the coach, newest first.
 */
@Component({
    selector: "app-monthly-reviews-list",
    standalone: true,
    imports: [CommonModule, Card, TranslatePipe],
    templateUrl: "./monthly-reviews-list.component.html",
})
export class MonthlyReviewsListComponent implements OnInit {
    reviews: MonthlyReview[] = [];

    loaded = false;

    constructor(
        private monthlyReviewService: MonthlyReviewService,
        private translationService: TranslationService,
    ) {}

    ngOnInit(): void {
        this.monthlyReviewService.getMonthlyReviews().subscribe({
            next: (response: MonthlyReview[]) => {
                this.reviews = (response ?? []).sort((a, b) => b.year - a.year || b.month - a.month);
                this.loaded = true;
            },
            error: (err) => {
                this.loaded = true;
                console.error(err);
            },
        });
    }

    monthName(review: MonthlyReview): string {
        return this.translationService.t(MonthKeys[review.month - 1]) + " " + review.year + ".";
    }
}
