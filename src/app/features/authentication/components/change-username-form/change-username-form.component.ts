import { Component, Input } from "@angular/core";
import { RedirectType } from "../../../../enums/redirect-type";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthResponse } from "../../models/auth-response";
import { AuthenticationService } from "../../services/authentication.service";
import { MessageService } from "primeng/api";
import { HelperService } from "../../../../shared/services/helper.service";
import { Button } from "primeng/button";
import { CommonModule } from "@angular/common";
import { InputText } from "primeng/inputtext";
import { ValidationService } from "../../../../shared/services/validation.service";

@Component({
  selector: "app-change-username-form",
  imports: [CommonModule, Button, ReactiveFormsModule, InputText],
  providers: [MessageService],
  templateUrl: "./change-username-form.component.html",
  styleUrl: "./change-username-form.component.scss",
})
export class ChangeUsernameFormComponent {
  @Input() redirectType!: RedirectType;
  @Input() dialogId!: string;
  @Input() returnUrl!: string;

  form!: FormGroup;

  loadingData = false;

  authResponse!: AuthResponse;

  constructor(
    public validationService: ValidationService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private helperService: HelperService,
    private formBuilder: FormBuilder,
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

    this.changeUsername();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      username: ["", [Validators.required]],
    });
  }

  private changeUsername() {
    this.authenticationService.changeUsername(this.form.value).subscribe(
      (response: AuthResponse) => {
        this.authResponse = Object.assign(response as AuthResponse);

        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail:
            "Username changed successfully. On next login you can use your new username.",
        });

        this.helperService.redirectUserAfterSubmit(
          this.redirectType,
          this.returnUrl,
          this.dialogId,
        );

        this.loadingData = false;
      },
      (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Password Reset Error.",
          detail: error.error.errors.generalErrors[0],
        });
        this.loadingData = false;
      },
    );
  }
}
