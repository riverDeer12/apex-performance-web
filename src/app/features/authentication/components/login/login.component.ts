import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from "../../services/authentication.service";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ValidationService} from "../../../../shared/services/validation.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {MessageService} from "primeng/api";
import {AuthResponse} from "../../models/auth-response";
import {PasswordModule} from "primeng/password";
import {CheckboxModule} from "primeng/checkbox";
import {AppFloatingConfigurator} from "../../../../layout/component/app.floatingconfigurator";
import {DialogFormComponent} from "../../../../shared/components/dialog-form/dialog-form.component";
import {EntityType} from "../../../../enums/entity-type";
import {ActionType} from "../../../../enums/action-type";
import {DialogService} from "primeng/dynamicdialog";
import { LayoutService } from '../../../../layout/service/layout.service';
import { environment } from "../../../../../environments/environment";
import { getErrorMessage } from "../../../../constants/error-codes";
import { TranslationService } from "../../../../i18n/translation.service";
import { TranslatePipe } from "../../../../i18n/translate.pipe";

@Component({
  selector: "app-login",
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    PasswordModule,
    CheckboxModule,
    AppFloatingConfigurator,
    NgOptimizedImage,
    RouterLink,
    TranslatePipe,
  ],
  providers: [DialogService],
  standalone: true,
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent implements OnInit {
  form!: FormGroup;

  loadingData!: boolean;

  authResponse!: AuthResponse;

  constructor(
    public layoutService: LayoutService,
    public validationService: ValidationService,
    private translationService: TranslationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {

    console.log(environment.apiUrl)

    if (this.authenticationService.isUserLogged()) {
      this.router.navigateByUrl("/admin/dashboard").then();
      return;
    } else {
      this.initForm();
    }
  }

  openForgotPasswordDialog(): void {
    this.dialogService.open(DialogFormComponent, {
      header: this.translationService.t("login.forgotDialogHeader"),
      data: {
        contentType: EntityType.Authentication,
        formType: ActionType.Create,
        dialogId: "resetPasswordForm",
      },
    });
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

    this.login();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required]],
      rememberMe: [false, [Validators.required]],
    });
  }

  private login() {
    this.authenticationService.login(this.form.value).subscribe(
      (response: AuthResponse) => {
        this.authResponse = Object.assign(response as AuthResponse);
        this.messageService.add({
          severity: "success",
          summary: this.translationService.t("common.success"),
          detail: this.translationService.t("login.successDetail"),
        });

        localStorage.setItem("token", this.authResponse.token);

        this.router.navigateByUrl("admin/dashboard").then();

        this.loadingData = false;
      },
      (error) => {
        this.messageService.add({
          severity: "error",
          summary: this.translationService.t("login.errorSummary"),
          detail: getErrorMessage(error),
        });
        this.loadingData = false;
      },
    );
  }
}
