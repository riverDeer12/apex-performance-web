import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from "../services/authentication.service";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ValidationService} from "../../../services/validation.service";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {AuthResponse} from "../models/auth-response";
import {PasswordModule} from "primeng/password";
import {CheckboxModule} from "primeng/checkbox";
import {AppFloatingConfigurator} from "../../../layout/component/app.floatingconfigurator";

@Component({
    selector: 'app-login',
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        ReactiveFormsModule,
        PasswordModule,
        CheckboxModule,
        AppFloatingConfigurator
    ],
    standalone: true,
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
    form!: FormGroup;

    loadingData = false;

    authResponse!: AuthResponse;

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private messageService: MessageService) {
    }

    ngOnInit(): void {
        if (this.authenticationService.isUserLogged()) {
            this.router.navigateByUrl("/admin/dashboard").then();
            return;
        } else {
            this.initForm();
        }
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

        this.login();
    }

    private initForm() {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]],
            rememberMe: [false, [Validators.required]]
        })
    }

    private login() {
        this.authenticationService.login(this.form.value).subscribe((response: AuthResponse) => {
            this.authResponse = Object.assign(response as AuthResponse);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Login Is Successful.'
            });

            localStorage.setItem('token', this.authResponse.token)

            this.router.navigateByUrl('admin/dashboard').then();

            this.loadingData = false;
        }, error => {
            this.messageService.add({
                severity: 'error',
                summary: 'Login Error',
                detail: error.message
            });
            this.loadingData = false;
        })
    }
}
