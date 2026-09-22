import {Component, Input} from '@angular/core';
import {Button} from "primeng/button";
import {NgIf} from "@angular/common";
import {Password} from "primeng/password";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from "@angular/forms";
import {AuthResponse} from "../../models/auth-response";
import {MessageService} from 'primeng/api';
import {UserService} from "../../../users/services/user.service";
import {ValidationService} from '../../../../shared/services/validation.service';
import {HelperService} from '../../../../shared/services/helper.service';
import {getErrorMessage} from '../../../../constants/error-codes';
import {RedirectType} from "../../../../enums/redirect-type";
import {TranslationService} from "../../../../i18n/translation.service";
import {TranslatePipe} from "../../../../i18n/translate.pipe";

@Component({
    selector: 'app-reset-password-form',
    imports: [
        Button,
        NgIf,
        Password,
        ReactiveFormsModule,
        TranslatePipe
    ],
    templateUrl: './reset-password-form.component.html',
    styleUrl: './reset-password-form.component.scss'
})
export class ResetPasswordFormComponent {
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    loadingData!: boolean;

    authResponse!: AuthResponse;

    constructor(public validationService: ValidationService,
                private translationService: TranslationService,
                private formBuilder: FormBuilder,
                private userService: UserService,
                private helperService: HelperService,
                private messageService: MessageService) {
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

        this.resetPassword();
    }

    private initForm() {
        this.form = this.formBuilder.group(
            {
                newPassword: ["", [Validators.required]],
                confirmPassword: ["", [Validators.required]],
            },
            {validators: this.passwordMatchValidator},
        );
    }

    private passwordMatchValidator(
        formGroup: AbstractControl,
    ): ValidationErrors | null {
        const newPassword = formGroup.get("newPassword")?.value;
        const confirmPassword = formGroup.get("confirmPassword")?.value;

        return newPassword === confirmPassword ? null : {passwordMismatch: true};
    }

    private resetPassword() {
        this.userService.resetPassword(this.form.value).subscribe(
            (response: AuthResponse) => {
                this.authResponse = Object.assign(response as AuthResponse);
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("resetPassword.successDetail"),
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);

                this.loadingData = false;
            },
            (error) => {
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("resetPassword.errorSummary"),
                    detail: getErrorMessage(error),
                });
                this.loadingData = false;
            },
        );
    }
}
