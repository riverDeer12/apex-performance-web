import { ActionType } from "../../../../enums/action-type";
import { RedirectType } from "../../../../enums/redirect-type";
import { BodyMeasurement } from "../../models/body-measurement";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { BodyMeasurementService } from "../../services/body-measurement.service";
import { MessageService } from "primeng/api";
import { ValidationService } from "../../../../shared/services/validation.service";
import { HelperService } from "../../../../shared/services/helper.service";
import { Component, Input, OnInit } from "@angular/core";
import { InputText } from "primeng/inputtext";
import { Button } from "primeng/button";
import { CommonModule } from "@angular/common";
import { Select } from "primeng/select";
import { ClientService } from "../../../clients/services/client.service";
import { Client } from "../../../clients/models/client";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { Roles } from "../../../../constants/roles";

@Component({
  selector: "app-body-measurement-form",
  imports: [CommonModule, InputText, ReactiveFormsModule, Button, Select],
  templateUrl: "./body-measurement-form.component.html",
  styleUrl: "./body-measurement-form.component.scss",
})
export class BodyMeasurementFormComponent implements OnInit {
  @Input() type!: ActionType;
  @Input() bodyMeasurement!: BodyMeasurement;
  @Input() redirectType!: RedirectType;
  @Input() dialogId!: string;
  @Input() returnUrl!: string;

  form!: FormGroup;

  loadingData = false;

  clients!: Client[];

  userRole!: string;

  constructor(
    public validationService: ValidationService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private bodyMeasurementService: BodyMeasurementService,
    private clientService: ClientService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  private loadClients(): void {
    this.clientService.getClients().subscribe((response: Client[]) => {
      this.clients = response.map((x: Client) =>
          Object.assign(new Client(), x),
      );
    });
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

    this.type == ActionType.Create
      ? this.createBodyMeasurement()
      : this.updateBodyMeasurement();
  }

  private initForm = () =>
    this.type == ActionType.Create
      ? this.initCreateForm()
      : this.initUpdateForm();

  private initCreateForm() {
    this.form = this.formBuilder.group({
      height: ["", [Validators.required, Validators.min(0)]],
      weight: ["", [Validators.required, Validators.min(0)]],
      shoulders: ["", [Validators.required, Validators.min(0)]],
      chest: ["", [Validators.required, Validators.min(0)]],
      upperArm: ["", [Validators.required, Validators.min(0)]],
      waist: ["", [Validators.required, Validators.min(0)]],
      thigh: ["", [Validators.required, Validators.min(0)]],
      calves: ["", [Validators.required, Validators.min(0)]],
      glutes: ["", [Validators.min(0)]],
      client: ["", [Validators.required]],
    });
  }

  private initUpdateForm() {
    this.form = this.formBuilder.group({
      height: [
        this.bodyMeasurement.height,
        [Validators.required, Validators.min(0)],
      ],
      weight: [
        this.bodyMeasurement.weight,
        [Validators.required, Validators.min(0)],
      ],
      shoulders: [
        this.bodyMeasurement.shoulders,
        [Validators.required, Validators.min(0)],
      ],
      chest: [
        this.bodyMeasurement.chest,
        [Validators.required, Validators.min(0)],
      ],
      upperArm: [
        this.bodyMeasurement.upperArm,
        [Validators.required, Validators.min(0)],
      ],
      waist: [
        this.bodyMeasurement.waist,
        [Validators.required, Validators.min(0)],
      ],
      thigh: [
        this.bodyMeasurement.thigh,
        [Validators.required, Validators.min(0)],
      ],
      calves: [
        this.bodyMeasurement.calves,
        [Validators.required, Validators.min(0)],
      ],
      glutes: [this.bodyMeasurement.glutes, [Validators.min(0)]],
      client: [this.bodyMeasurement.clientId, [Validators.required]],
    });
  }

  private createBodyMeasurement() {
    this.bodyMeasurementService
      .createBodyMeasurement(this.form.value)
      .subscribe({
        next: (response: BodyMeasurement) => {
          this.bodyMeasurement = Object.assign(new BodyMeasurement(), response);

          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Body Measurement is created successfully.",
          });

          this.helperService.redirectUserAfterSubmit(
            this.redirectType,
            this.returnUrl,
            this.dialogId,
          );
        },
        error: (error) => {
          console.error("Error:", error);

          this.messageService.add({
            severity: "error",
            summary: "Error Creating Body Measurement",
            detail: error.message || "An unexpected error occurred.",
          });
        },
        complete: () => {
          this.loadingData = false;
        },
      });
  }

  private updateBodyMeasurement() {
    this.bodyMeasurementService
      .updateBodyMeasurement(this.bodyMeasurement.id, this.form.value)
      .subscribe({
        next: (response: BodyMeasurement) => {
          this.bodyMeasurement = Object.assign(new BodyMeasurement(), response);

          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Body Measurement is updated successfully.",
          });

          this.helperService.redirectUserAfterSubmit(
            this.redirectType,
            this.returnUrl,
            this.dialogId,
          );
        },
        error: (error) => {
          console.error("Error:", error);

          this.messageService.add({
            severity: "error",
            summary: "Error Updating Body Measurement",
            detail: error.message || "An unexpected error occurred.",
          });
        },
        complete: () => {
          this.loadingData = false;
        },
      });
  }
}
