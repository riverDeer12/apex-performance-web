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
import {ValidationService} from '../../../../services/validation.service';
import {HelperService} from '../../../../services/helper.service';
import {RedirectType} from "../../../../enums/redirect-type";
import {Router} from '@angular/router';

@Component({
    selector: 'app-reset-password-form',
    imports: [
        Button,
        NgIf,
        Password,
        ReactiveFormsModule
    ],
    templateUrl: './reset-password-form.component.html',
    styleUrl: './reset-password-form.component.scss'
})
export class ResetPasswordFormComponent {
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    loadingData = false;

    authResponse!: AuthResponse;

    constructor(public validationService: ValidationService,
                private formBuilder: FormBuilder,
                private router: Router,
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
                summary: "Incomplete or incorrect data",
                detail: "Check the entered data and try again.",
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
                    summary: "Success",
                    detail: "Password reset successfully. On next login you can use your new password.",
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);

                this.loadingData = false;
            },
            (error) => {
                this.messageService.add({
                    severity: "error",
                    summary: "Password Reset Error.",
                    detail: error.message,
                });
                this.loadingData = false;
            },
        );
    }
}
