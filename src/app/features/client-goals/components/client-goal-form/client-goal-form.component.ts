import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { Button } from "primeng/button";
import { DatePicker } from "primeng/datepicker";
import { Textarea } from "primeng/textarea";
import { ActionType } from "../../../../enums/action-type";
import { RedirectType } from "../../../../enums/redirect-type";
import { getErrorMessage } from "../../../../constants/error-codes";
import { HelperService } from "../../../../shared/services/helper.service";
import { ValidationService } from "../../../../shared/services/validation.service";
import { TranslationService } from "../../../../i18n/translation.service";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { Client } from "../../../clients/models/client";
import { ClientGoal, ClientGoalRequest } from "../../models/client-goal";
import { ClientGoalService } from "../../services/client-goal.service";

/**
 * Coach's form for client's goal and plan,
 * one goal and plan per client.
 */
@Component({
    selector: "app-client-goal-form",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, Button, DatePicker, Textarea, TranslatePipe],
    templateUrl: "./client-goal-form.component.html",
})
export class ClientGoalFormComponent implements OnInit {
    @Input() type!: ActionType;
    @Input() client!: Client;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    loadingData = false;

    loadingGoal = true;

    updatedAt: string | null = null;

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private clientGoalService: ClientGoalService,
        private helperService: HelperService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {}

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            goal: ["", [Validators.maxLength(1000)]],
            currentBlock: ["", [Validators.maxLength(1000)]],
            focus: ["", [Validators.maxLength(1000)]],
            nextAssessment: ["", [Validators.maxLength(500)]],
            nextAssessmentDate: [null as Date | null],
        });

        this.loadGoal();
    }

    private loadGoal(): void {
        this.clientGoalService.getClientGoal(this.client.id).subscribe({
            next: (response: ClientGoal) => {
                this.updatedAt = response?.updatedAt ?? null;
                this.form.patchValue({
                    goal: response?.goal ?? "",
                    currentBlock: response?.currentBlock ?? "",
                    focus: response?.focus ?? "",
                    nextAssessment: response?.nextAssessment ?? "",
                    nextAssessmentDate: this.toLocalDate(response?.nextAssessmentDate ?? null),
                });
                this.loadingGoal = false;
            },
            error: (error) => {
                this.loadingGoal = false;
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("common.error"),
                    detail: getErrorMessage(error),
                });
            },
        });
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
        const request: ClientGoalRequest = {
            goal: this.emptyToNull(value.goal),
            currentBlock: this.emptyToNull(value.currentBlock),
            focus: this.emptyToNull(value.focus),
            nextAssessment: this.emptyToNull(value.nextAssessment),
            nextAssessmentDate: this.toUtcDate(value.nextAssessmentDate),
        };

        this.clientGoalService.updateClientGoal(this.client.id, request).subscribe({
            next: () => {
                this.loadingData = false;

                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("clientGoals.savedDetail"),
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                this.loadingData = false;

                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("clientGoals.saveErrorSummary"),
                    detail: getErrorMessage(error),
                });
            },
        });
    }

    private emptyToNull(value: string | null): string | null {
        const trimmed = (value ?? "").trim();
        return trimmed.length ? trimmed : null;
    }

    /**
     * Picked day is sent as UTC midnight so it
     * doesn't move to previous day because of time zone.
     */
    private toUtcDate(date: Date | null): string | null {
        if (!date) return null;
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
    }

    private toLocalDate(value: string | null): Date | null {
        if (!value) return null;
        const date = new Date(value);
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }
}
