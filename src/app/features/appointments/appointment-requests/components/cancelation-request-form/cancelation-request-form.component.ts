import {Component, Input, OnInit} from '@angular/core';
import {ActionType} from "../../../../../enums/action-type";
import {Client} from "../../../../clients/models/client";
import {RedirectType} from "../../../../../enums/redirect-type";
import {Button} from "primeng/button";
import {InputText} from "primeng/inputtext";
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ValidationService} from "../../../../../shared/services/validation.service";
import {HelperService} from "../../../../../shared/services/helper.service";
import {getErrorMessage} from "../../../../../constants/error-codes";
import {AppointmentTypeService} from "../../../appointment-types/services/appointment-type.service";
import {MessageService} from "primeng/api";
import {AppointmentType} from "../../../appointment-types/models/appointment-type";
import {AppointmentRequestService} from "../../services/appointment-request.service";
import {AppointmentRequest} from "../../models/appointment-request";
import {StatusResponse} from "../../../../../shared/status-response";
import {TranslationService} from "../../../../../i18n/translation.service";
import {TranslatePipe} from "../../../../../i18n/translate.pipe";

@Component({
  selector: 'app-cancelation-request-form',
  imports: [
    Button,
    InputText,
    NgIf,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './cancelation-request-form.component.html',
  styleUrl: './cancelation-request-form.component.scss'
})
export class CancelationRequestFormComponent implements OnInit {
  @Input() type!: ActionType;
  @Input() redirectType!: RedirectType;
  @Input() dialogId!: string;
  @Input() appointmentId!: string;
  @Input() returnUrl!: string;

  cancelationRequest!: StatusResponse;

  form!: FormGroup;

  loadingData!: boolean;

  constructor(
      public validationService: ValidationService,
      private formBuilder: FormBuilder,
      private helperService: HelperService,
      private appointmentRequestService: AppointmentRequestService,
      private messageService: MessageService,
      private translationService: TranslationService,
  ) {
  }

  ngOnInit(): void {
    this.initCreateForm();
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

    this.createCancelationRequest();
  }

  private initCreateForm() {
    this.form = this.formBuilder.group({
      comment: ["", [Validators.required]],
    });
  }

  private createCancelationRequest() {
    this.appointmentRequestService.createCancelationRequest(this.form.value, this.appointmentId).subscribe({
      next: (response: StatusResponse) => {
        this.cancelationRequest = Object.assign(new StatusResponse(), response);

        this.messageService.add({
          severity: "success",
          summary: this.translationService.t("common.success"),
          detail: this.translationService.t("appointmentRequests.createdDetail"),
        });

        this.helperService.redirectUserAfterSubmit(
            this.redirectType,
            this.returnUrl,
            this.dialogId,
        );
      },
      error: (error: any) => {
        this.messageService.add({
          severity: "error",
          summary: this.translationService.t("appointmentRequests.createErrorSummary"),
          detail: getErrorMessage(error),
        });
      },
      complete: () => {
        this.loadingData = false;
      },
    });
  }
}
