import {Component, Input} from '@angular/core';
import {InputText} from 'primeng/inputtext';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Button} from 'primeng/button';
import {ActionType} from '../../../../../enums/action-type';
import {RedirectType} from '../../../../../enums/redirect-type';
import {AppointmentType} from '../../models/appointment-type';
import {ValidationService} from '../../../../../shared/services/validation.service';
import {HelperService} from '../../../../../shared/services/helper.service';
import {getErrorMessage} from '../../../../../constants/error-codes';
import {AppointmentTypeService} from '../../services/appointment-type.service';
import {MessageService} from 'primeng/api';
import {TranslationService} from '../../../../../i18n/translation.service';
import {TranslatePipe} from '../../../../../i18n/translate.pipe';

@Component({
    selector: "app-appointment-type-form",
    imports: [InputText, NgIf, ReactiveFormsModule, Button, TranslatePipe],
    templateUrl: "./appointment-type-form.component.html",
    styleUrl: "./appointment-type-form.component.scss",
})
export class AppointmentTypeFormComponent {
    @Input() type!: ActionType;
    @Input() appointmentType!: AppointmentType;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    loadingData!: boolean;

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private helperService: HelperService,
        private appointmentTypeService: AppointmentTypeService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {
    }

    ngOnInit(): void {
        this.initForm();
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

        this.type == ActionType.Create
            ? this.createAppointmentType()
            : this.updateAppointmentType();
    }

    private initForm = () =>
        this.type == ActionType.Create
            ? this.initCreateForm()
            : this.initUpdateForm();

    private initCreateForm() {
        this.form = this.formBuilder.group({
            name: ["", [Validators.required]],
        });
    }

    private initUpdateForm() {
        this.form = this.formBuilder.group({
            name: [this.appointmentType.name, [Validators.required]],
        });
    }

    private createAppointmentType() {
        this.appointmentTypeService.createAppointmentType(this.form.value).subscribe({
            next: (response: AppointmentType) => {
                this.appointmentType = Object.assign(new AppointmentType(), response);

                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("appointmentTypes.createdDetail"),
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
                    summary: this.translationService.t("appointmentTypes.createErrorSummary"),
                    detail: getErrorMessage(error),
                });
            },
            complete: () => {
                this.loadingData = false;
            },
        });
    }

    private updateAppointmentType() {
        this.appointmentTypeService
            .updateAppointmentType(this.appointmentType.id, this.form.value)
            .subscribe({
                next: (response: AppointmentType) => {
                    this.appointmentType = Object.assign(new AppointmentType(), response);

                    this.messageService.add({
                        severity: "success",
                        summary: this.translationService.t("common.success"),
                        detail: this.translationService.t("appointmentTypes.updatedDetail"),
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
                        summary: this.translationService.t("appointmentTypes.updateErrorSummary"),
                        detail: getErrorMessage(error),
                    });
                },
                complete: () => {
                    this.loadingData = false;
                },
            });
    }
}
