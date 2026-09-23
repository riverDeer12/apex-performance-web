import { Component, Input } from "@angular/core";
import { ActionType } from "../../../../../enums/action-type";
import { RedirectType } from "../../../../../enums/redirect-type";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from "../../../models/client";
import { ValidationService } from "../../../../../shared/services/validation.service";
import { HelperService } from "../../../../../shared/services/helper.service";
import { getErrorMessage } from "../../../../../constants/error-codes";
import { ClientService } from "../../../services/client.service";
import { MessageService } from "primeng/api";
import { AuthenticationService } from "../../../../authentication/services/authentication.service";
import { FunctionalMovementScreen } from "../../models/functional-movement-screen";
import { FunctionalMovementScreenService } from "../../services/functional-movement-screen.service";
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TranslationService } from "../../../../../i18n/translation.service";
import { TranslatePipe } from "../../../../../i18n/translate.pipe";

@Component({
  selector: "app-functional-movement-screen-form",
  imports: [CommonModule, Button, ReactiveFormsModule, InputText, Select, TranslatePipe],
  templateUrl: "./functional-movement-screen-form.component.html",
  styleUrl: "./functional-movement-screen-form.component.scss",
})
export class FunctionalMovementScreenFormComponent {
  @Input() type!: ActionType;
  @Input() functionalMovementScreen!: FunctionalMovementScreen;
  @Input() redirectType!: RedirectType;
  @Input() dialogId!: string;
  @Input() returnUrl!: string;

  form!: FormGroup;

  loadingData!: boolean;

  clients!: Client[];

  userRole!: string;

  constructor(
    public validationService: ValidationService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private functionalMovementScreenService: FunctionalMovementScreenService,
    private clientService: ClientService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private translationService: TranslationService,
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
        summary: this.translationService.t("common.incompleteTitle"),
        detail: this.translationService.t("common.incompleteDetail"),
      });

      this.loadingData = false;

      return;
    }

    this.type == ActionType.Create
      ? this.createFunctionalMovementScreen()
      : this.updateFunctionalMovementScreen();
  }

  private initForm = () =>
    this.type == ActionType.Create
      ? this.initCreateForm()
      : this.initUpdateForm();

  private initCreateForm() {
    this.form = this.formBuilder.group({
      deepSquat: ["", [Validators.required]],
      hurdleStep: ["", [Validators.required]],
      inLineLunge: ["", [Validators.required]],
      activeStraightLegRaise: ["", [Validators.required]],
      trunkStabilityPushUp: ["", [Validators.required]],
      rotaryStability: ["", [Validators.required]],
      shoulderMobility: ["", [Validators.required]],
      client: ["", [Validators.required]],
    });
  }

  private initUpdateForm() {
    this.form = this.formBuilder.group({
      deepSquat: [
        this.functionalMovementScreen.deepSquat,
        [Validators.required],
      ],
      hurdleStep: [
        this.functionalMovementScreen.hurdleStep,
        [Validators.required],
      ],
      inLineLunge: [
        this.functionalMovementScreen.inLineLunge,
        [Validators.required],
      ],
      activeStraightLegRaise: [
        this.functionalMovementScreen.activeStraightLegRaise,
        [Validators.required],
      ],
      trunkStabilityPushUp: [
        this.functionalMovementScreen.trunkStabilityPushUp,
        [Validators.required],
      ],
      rotaryStability: [
        this.functionalMovementScreen.rotaryStability,
        [Validators.required],
      ],
      shoulderMobility: [
        this.functionalMovementScreen.shoulderMobility,
        [Validators.required],
      ],
      client: [this.functionalMovementScreen.client.id, [Validators.required]],
    });
  }

  private createFunctionalMovementScreen() {
    this.functionalMovementScreenService
      .createFunctionalMovementScreen(this.form.value)
      .subscribe({
        next: (response: FunctionalMovementScreen) => {
          this.functionalMovementScreen = Object.assign(
            new FunctionalMovementScreen(),
            response,
          );

          this.messageService.add({
            severity: "success",
            summary: this.translationService.t("common.success"),
            detail: this.translationService.t("fms.createdDetail"),
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
            summary: this.translationService.t("fms.createErrorSummary"),
            detail: getErrorMessage(error),
          });
        },
        complete: () => {
          this.loadingData = false;
        },
      });
  }

  private updateFunctionalMovementScreen() {
    this.functionalMovementScreenService
      .updateFunctionalMovementScreen(
        this.functionalMovementScreen.id,
        this.form.value,
      )
      .subscribe({
        next: (response: FunctionalMovementScreen) => {
          this.functionalMovementScreen = Object.assign(
            new FunctionalMovementScreen(),
            response,
          );

          this.messageService.add({
            severity: "success",
            summary: this.translationService.t("common.success"),
            detail: this.translationService.t("fms.updatedDetail"),
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
            summary: this.translationService.t("fms.updateErrorSummary"),
            detail: getErrorMessage(error),
          });
        },
        complete: () => {
          this.loadingData = false;
        },
      });
  }
}
