import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from "@angular/forms";
import {MessageService} from "primeng/api";
import {AuthResponse} from "../../../authentication/models/auth-response";
import {AuthenticationService} from "../../../authentication/services/authentication.service";
import {AppFloatingConfigurator} from "../../../../layout/component/app.floatingconfigurator";
import {InputText} from "primeng/inputtext";
import {Password} from "primeng/password";
import {Button} from "primeng/button";
import {UserService} from "../../services/user.service";

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [
        AppFloatingConfigurator,
        InputText,
        ReactiveFormsModule,
        Password,
        Button
    ],
    providers: [MessageService],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {

    token!: string;

    form!: FormGroup;

    loadingData = false;

    authResponse!: AuthResponse;

    constructor(private route: ActivatedRoute, private formBuilder: FormBuilder,
                private router: Router,
                private userService: UserService,
                private authenticationService: AuthenticationService,
                private messageService: MessageService) {
        this.initForm();
    }

    ngOnInit(): void {
        this.handleToken();
    }

    submit() {
        this.loadingData = true;

        if (this.form.invalid) {

            this.form.markAllAsTouched();

            this.messageService
                .add({
                    severity: 'warn',
                    summary: 'Incomplete or incorrect data',
                    detail: 'Check the entered data and try again.'
                });

            this.loadingData = false;

            return;
        }

        this.resetPassword();
    }

    private initForm() {
        this.form = this.formBuilder.group({
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]]
        }, {validators: this.passwordMatchValidator});
    }

    private passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
        const password = formGroup.get('password')?.value;
        const confirmPassword = formGroup.get('confirmPassword')?.value;

        return password === confirmPassword ? null : {passwordMismatch: true};
    }

    private resetPassword() {
        this.userService.resetPassword(this.form.value).subscribe((response: AuthResponse) => {
            this.authResponse = Object.assign(response as AuthResponse);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Password reset successfully.'
            });

            this.router.navigateByUrl('admin/dashboard').then();

            this.loadingData = false;
        }, error => {
            this.messageService.add({
                severity: 'error',
                summary: 'Password Reset Error.',
                detail: error.message
            });
            this.loadingData = false;
        })
    }

    private handleToken() {
        this.token = this.route.snapshot.paramMap.get('token') || '';

        const isTokenValid = this.authenticationService.validateToken(this.token)

        if (isTokenValid) {
            localStorage.setItem('token', this.token);
        }
    }
}
