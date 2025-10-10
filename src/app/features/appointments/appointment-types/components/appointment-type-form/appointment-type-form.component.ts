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
import {AppointmentTypeService} from '../../services/appointment-type.service';
import {MessageService} from 'primeng/api';

@Component({
    selector: "app-appointment-type-form",
    imports: [InputText, NgIf, ReactiveFormsModule, Button],
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
                summary: "Incomplete or incorrect data",
                detail: "Check the entered data and try again.",
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
                    summary: "Success",
                    detail: "AppointmentType is created successfully.",
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
                    summary: "Error Creating AppointmentType",
                    detail: error.error.errors.generalErrors[0] || "An unexpected error occurred.",
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
                        summary: "Success",
                        detail: "AppointmentType is updated successfully.",
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
                        summary: "Error Updating AppointmentType",
                        detail: error.error.errors.generalErrors[0] || "An unexpected error occurred.",
                    });
                },
                complete: () => {
                    this.loadingData = false;
                },
            });
    }
}
