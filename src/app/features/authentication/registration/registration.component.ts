import { Component } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ValidationService } from "../../../shared/services/validation.service";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { AppFloatingConfigurator } from "../../../layout/component/app.floatingconfigurator";
import { LayoutService } from "../../../layout/service/layout.service";
import { AuthenticationService } from "../services/authentication.service";
import { RegisterResponse } from "../models/register-response";
import { getErrorMessage } from "../../../constants/error-codes";

@Component({
  selector: "app-registration",
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    AppFloatingConfigurator,
    NgOptimizedImage,
  ],
  standalone: true,
  templateUrl: "./registration.component.html",
  styleUrl: "./registration.component.scss",
})
export class RegistrationComponent {
  form!: FormGroup;

  loadingData!: boolean;

  registered!: boolean;

  registeredUsername!: string;

  constructor(
    public layoutService: LayoutService,
    public validationService: ValidationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
  ) {
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

    this.register();
  }

  goToLogin() {
    this.router.navigateByUrl("authentication/login").then();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required]],
    });
  }

  private register() {
    this.authenticationService.register(this.form.value).subscribe(
      (response: RegisterResponse) => {
        this.registered = true;
        this.registeredUsername = response.username;

        this.messageService.add({
          severity: "success",
          summary: "Registration Successful",
          detail: `Your username is ${response.username}. Check your email for a link to set your password.`,
        });

        this.loadingData = false;
      },
      (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Registration Error",
          detail: getErrorMessage(error),
        });
        this.loadingData = false;
      },
    );
  }
}
