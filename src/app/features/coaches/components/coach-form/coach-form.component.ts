import {Component, Input, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {InputText} from "primeng/inputtext";
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActionType} from "../../../../enums/action-type";
import {RedirectType} from "../../../../enums/redirect-type";
import {ValidationService} from "../../../../shared/services/validation.service";
import {HelperService} from "../../../../shared/services/helper.service";
import {getErrorMessage} from "../../../../constants/error-codes";
import {MessageService} from "primeng/api";
import {Coach} from "../../models/coach";
import {CoachService} from "../../services/coach.service";
import {Client} from "../../../clients/models/client";
import {ClientService} from "../../../clients/services/client.service";
import {MultiSelect} from "primeng/multiselect";
import {TranslationService} from "../../../../i18n/translation.service";
import {TranslatePipe} from "../../../../i18n/translate.pipe";

@Component({
  selector: 'app-coach-form',
    imports: [
        Button,
        InputText,
        NgIf,
        ReactiveFormsModule,
        MultiSelect,
        TranslatePipe
    ],
  templateUrl: './coach-form.component.html',
  styleUrl: './coach-form.component.scss'
})
export class CoachFormComponent implements OnInit {
    @Input() type!: ActionType;
    @Input() coach!: Coach;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    loadingData!: boolean;

    clients!: Client[];

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private helperService: HelperService,
        private coachService: CoachService,
        private messageService: MessageService,
        private clientService: ClientService,
        private translationService: TranslationService,
    ) {
    }

    ngOnInit(): void {
        this.initForm();
        this.getClients();
    }

    submit() {
        this.loadingData = true;

        if (this.form.invalid) {
            this.form.markAllAsTouched();

            this.messageService.add({
                severity: "warn",
                summary: this.translationService.t("common.incompleteTitle"),
                detail: this.translationService.t("common.incompleteDetail"),
            });

            this.loadingData = false;

            return;
        }

        this.type == ActionType.Create ? this.createCoach() : this.updateCoach();
    }

    private initForm = () =>
        this.type == ActionType.Create
            ? this.initCreateForm()
            : this.initUpdateForm();

    private initCreateForm() {
        this.form = this.formBuilder.group({
            firstName: ["", [Validators.required]],
            lastName: ["", [Validators.required]],
            email: ["", [Validators.required, Validators.email]],
            phone: ["", [Validators.required]],
            clients: [[]],
        });
    }

    private initUpdateForm() {
        this.form = this.formBuilder.group({
            firstName: [this.coach.firstName, [Validators.required]],
            lastName: [this.coach.lastName, [Validators.required]],
            email: [this.coach.email, [Validators.required, Validators.email]],
            phone: [this.coach.phone, [Validators.required]],
            clients: [this.coach.clients?.map(x => x.id)],
        });
    }

    private createCoach() {
        this.coachService.createCoach(this.form.value).subscribe({
            next: (response: Coach) => {
                this.coach = Object.assign(new Coach(), response);

                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("coaches.createdDetail"),
                });

                this.helperService.redirectUserAfterSubmit(
                    this.redirectType,
                    this.returnUrl,
                    this.dialogId,
                );
            },
            error: (error) => {
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("coaches.createErrorSummary"),
                    detail: getErrorMessage(error),
                });
            },
            complete: () => {
                this.loadingData = false;
            },
        });
    }

    private updateCoach() {
        this.coachService.updateCoach(this.coach.id, this.form.value).subscribe({
            next: (response: Coach) => {
                this.coach = Object.assign(new Coach(), response);

                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("coaches.updatedDetail"),
                });

                this.helperService.redirectUserAfterSubmit(
                    this.redirectType,
                    this.returnUrl,
                    this.dialogId,
                );
            },
            error: (error) => {
                console.error("Error:", error);

                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("coaches.updateErrorSummary"),
                    detail: getErrorMessage(error),
                });
            },
            complete: () => {
                this.loadingData = false;
            },
        });
    }

    private getClients() {
        this.clientService.getClients().subscribe((response: Client[]) => {
            this.clients = response;
        });
    }
}
