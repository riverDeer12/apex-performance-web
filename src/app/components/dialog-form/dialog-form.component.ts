import { Component } from "@angular/core";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { ActionType } from "../../enums/action-type";
import { EntityType } from "../../enums/entity-type";
import { CommonModule } from "@angular/common";
import { DialogFormConfig } from "../../constants/dialog-form-config";
import { AdministratorFormComponent } from "../../features/administrators/components/administrator-form/administrator-form.component";
import { UserFormComponent } from "../../features/users/components/user-form/user-form.component";
import { RedirectType } from "../../enums/redirect-type";
import { DialogHelperService } from "../../services/dialog-helper.service";
import { RoleFormComponent } from "../../features/roles/roles/components/role-form/role-form.component";
import { ClientFormComponent } from "../../features/clients/components/client-form/client-form.component";
import { AppointmentFormComponent } from "../../features/appointments/components/appointment-form/appointment-form.component";
import { AppointmentTypeFormComponent } from "../../features/appointments/components/appointment-type-form/appointment-type-form.component";
import { EmailFormComponent } from "../../features/authentication/components/email-form/email-form.component";
import {
  BodyMeasurementFormComponent
} from "../../features/body-measurements/components/body-measurement-form/body-measurement-form.component";
import {CoachFormComponent} from "../../features/coaches/components/coach-form/coach-form.component";
import {
  ResetPasswordFormComponent
} from "../../features/authentication/components/reset-password-form/reset-password-form.component";
import {
  CancelationRequestFormComponent
} from "../../features/appointments/components/cancelation-request-form/cancelation-request-form.component";

@Component({
  selector: "app-dialog-form",
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    AdministratorFormComponent,
    UserFormComponent,
    RoleFormComponent,
    ClientFormComponent,
    AppointmentFormComponent,
    AppointmentTypeFormComponent,
    EmailFormComponent,
    BodyMeasurementFormComponent,
    CoachFormComponent,
    ResetPasswordFormComponent,
    CancelationRequestFormComponent,
  ],
  standalone: true,
  templateUrl: "./dialog-form.component.html",
  styleUrl: "./dialog-form.component.scss",
})
export class DialogFormComponent {
  contentType!: EntityType;
  dialogId!: string;
  formType!: ActionType;
  data: any;

  redirectType = RedirectType.CloseDialog;

  public get entityType(): typeof EntityType {
    return EntityType;
  }

  constructor(
    private dialogRef: DynamicDialogRef,
    private dialogHelperService: DialogHelperService,
    private dialogConfig: DynamicDialogConfig,
  ) {
    this.initSettings();
    this.initContentType();
    this.setDialogCloseListener();
  }

  /**
   * Set dialog settings.
   */
  initSettings(): void {
    this.dialogConfig.autoZIndex = DialogFormConfig.autoZIndex;
    this.dialogConfig.dismissableMask = DialogFormConfig.dismissableMask;
    this.dialogConfig.closeOnEscape = DialogFormConfig.closeOnEscape;
    this.dialogConfig.transitionOptions = DialogFormConfig.transitionOptions;
    this.dialogConfig.style = DialogFormConfig.style;
    this.dialogConfig.draggable = DialogFormConfig.draggable;
    this.dialogConfig.resizable = DialogFormConfig.resizable;
  }

  /**
   * Set dialog content type.
   */
  initContentType(): void {
    this.contentType = this.dialogConfig.data.contentType;
    this.formType = this.dialogConfig.data.formType;
    this.data = this.dialogConfig.data.data;
    this.dialogId = this.dialogConfig.data.dialogId;
  }

  /**
   * Set listener for
   * close dialog event.
   */
  setDialogCloseListener(): void {
    this.dialogHelperService.getDialogStatus().subscribe((response: string) => {
      if (this.dialogId === (response as string)) {
        this.dialogRef.close(response);
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
