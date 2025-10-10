import { Component, Input } from "@angular/core";
import { ActionType } from "../../../../enums/action-type";
import { RedirectType } from "../../../../enums/redirect-type";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthenticationService } from "../../services/authentication.service";
import { MessageService } from "primeng/api";
import { AuthResponse } from "../../models/auth-response";
import { HelperService } from "../../../../shared/services/helper.service";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";

@Component({
  selector: "app-email-form",
  imports: [Button, InputText, ReactiveFormsModule],
  standalone: true,
  templateUrl: "./email-form.component.html",
  styleUrl: "./email-form.component.scss",
})
export class EmailFormComponent {
  @Input() type!: ActionType;
  @Input() dialogId!: string;
  @Input() redirectType!: RedirectType;

  form!: FormGroup;

  loadingData!: boolean;

  authResponse!: AuthResponse;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {}

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

    this.sendEmail();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      email: ["", [Validators.required]],
    });
  }

  private sendEmail() {
    this.authenticationService.forgotPassword(this.form.value).subscribe(
      (response) => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Sent email successfully. You will get password link soon.",
        });

        this.helperService.redirectUserAfterSubmit(
          this.redirectType,
          "",
          this.dialogId,
        );

        this.loadingData = false;
      },
      (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error sending email.",
          detail: error.error.errors.generalErrors[0],
        });
        this.loadingData = false;
      },
    );
  }
}
