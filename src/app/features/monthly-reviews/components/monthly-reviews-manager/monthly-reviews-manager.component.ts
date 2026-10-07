import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { Button } from "primeng/button";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { Select } from "primeng/select";
import { Textarea } from "primeng/textarea";
import { getErrorMessage } from "../../../../constants/error-codes";
import { ValidationService } from "../../../../shared/services/validation.service";
import { TranslationService } from "../../../../i18n/translation.service";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { Client } from "../../../clients/models/client";
import { MonthKeys, MonthlyReview, MonthlyReviewRequest } from "../../models/monthly-review";
import { MonthlyReviewService } from "../../services/monthly-review.service";

/**
 * Coach's view of client's monthly reviews, list
 * of written reviews and form for chosen month.
 */
@Component({
    selector: "app-monthly-reviews-manager",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, Button, Select, Textarea, TranslatePipe],
    templateUrl: "./monthly-reviews-manager.component.html",
})
export class MonthlyReviewsManagerComponent implements OnInit {
    client: Client;

    reviews: MonthlyReview[] = [];

    loaded = false;

    form!: FormGroup;

    loadingData = false;

    constructor(
        config: DynamicDialogConfig,
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private monthlyReviewService: MonthlyReviewService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private translationService: TranslationService,
    ) {
        this.client = config.data.client;
    }

    get monthOptions(): { label: string; value: number }[] {
        return MonthKeys.map((key, index) => ({
            label: this.translationService.t(key),
            value: index + 1,
        }));
    }

    get yearOptions(): { label: string; value: number }[] {
        const currentYear = new Date().getFullYear();
        const years = new Set<number>([currentYear - 1, currentYear, currentYear + 1]);
        this.reviews.forEach(x => years.add(x.year));

        return [...years].sort((a, b) => b - a).map(x => ({ label: String(x), value: x }));
    }

    // Review of currently chosen month, if already written.
    get selectedReview(): MonthlyReview | undefined {
        const { year, month } = this.form.getRawValue();
        return this.reviews.find(x => x.year === year && x.month === month);
    }

    ngOnInit(): void {
        const now = new Date();

        this.form = this.formBuilder.group({
            year: [now.getFullYear(), [Validators.required]],
            month: [now.getMonth() + 1, [Validators.required]],
            content: ["", [Validators.required, Validators.maxLength(4000)]],
        });

        this.form.controls["year"].valueChanges.subscribe(() => this.fillContent());
        this.form.controls["month"].valueChanges.subscribe(() => this.fillContent());

        this.loadData();
    }

    monthName(review: MonthlyReview): string {
        return this.translationService.t(MonthKeys[review.month - 1]) + " " + review.year + ".";
    }

    edit(review: MonthlyReview): void {
        this.form.patchValue({ year: review.year, month: review.month }, { emitEvent: false });
        this.fillContent();
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();

            this.messageService.add({
                severity: "warn",
                summary: this.translationService.t("common.incompleteTitle"),
                detail: this.translationService.t("common.incompleteDetail"),
            });

            return;
        }

        this.loadingData = true;

        const value = this.form.value;
        const request: MonthlyReviewRequest = {
            client: this.client.id,
            year: value.year,
            month: value.month,
            content: (value.content as string).trim(),
        };

        this.monthlyReviewService.saveMonthlyReview(request).subscribe({
            next: () => {
                this.loadingData = false;

                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("monthlyReviews.savedDetail"),
                });

                this.loadData();
            },
            error: (error) => {
                this.loadingData = false;

                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("monthlyReviews.saveErrorSummary"),
                    detail: getErrorMessage(error),
                });
            },
        });
    }

    confirmDelete(review: MonthlyReview): void {
        this.confirmationService.confirm({
            message: this.translationService.t("monthlyReviews.deleteConfirm"),
            header: this.translationService.t("common.confirmDeletionHeader") + " " + this.monthName(review),
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
                this.monthlyReviewService.deleteMonthlyReview(review.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: "success",
                            summary: this.translationService.t("common.success"),
                            detail: this.translationService.t("monthlyReviews.deletedDetail"),
                        });

                        this.loadData();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: "error",
                            summary: this.translationService.t("monthlyReviews.deleteErrorSummary"),
                            detail: getErrorMessage(error),
                        });
                    },
                });
            },
        });
    }

    private loadData(): void {
        this.monthlyReviewService.getMonthlyReviews(this.client.id).subscribe({
            next: (response: MonthlyReview[]) => {
                this.reviews = (response ?? [])
                    .map(x => Object.assign(new MonthlyReview(), x))
                    .sort((a, b) => b.year - a.year || b.month - a.month);
                this.loaded = true;
                this.fillContent();
            },
            error: (error) => {
                this.loaded = true;
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("common.error"),
                    detail: getErrorMessage(error),
                });
            },
        });
    }

    /**
     * Fill form with existing review of chosen month,
     * or clear it when the month has no review yet.
     */
    private fillContent(): void {
        this.form.controls["content"].setValue(this.selectedReview?.content ?? "");
        this.form.controls["content"].markAsUntouched();
    }
}
