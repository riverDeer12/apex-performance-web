import { Component, Input } from "@angular/core";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { NgIf } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActionType } from "../../../../enums/action-type";
import { RedirectType } from "../../../../enums/redirect-type";
import { User } from "../../../users/models/user";
import { ValidationService } from "../../../../services/validation.service";
import { HelperService } from "../../../../services/helper.service";
import { UserService } from "../../../users/services/user.service";
import { MessageService } from "primeng/api";
import { Client } from "../../models/client";
import { ClientService } from "../../services/client.service";

@Component({
  selector: "app-client-form",
  imports: [Button, InputText, NgIf, ReactiveFormsModule],
  templateUrl: "./client-form.component.html",
  styleUrl: "./client-form.component.scss",
})
export class ClientFormComponent {
  @Input() type!: ActionType;
  @Input() client!: Client;
  @Input() redirectType!: RedirectType;
  @Input() dialogId!: string;
  @Input() returnUrl!: string;

  form!: FormGroup;

  users!: User[];

  loadingData = false;

  constructor(
    public validationService: ValidationService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private userService: UserService,
    private clientService: ClientService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getUsers();
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

    this.type == ActionType.Create ? this.createClient() : this.updateClient();
  }

  private initForm = () =>
    this.type == ActionType.Create
      ? this.initCreateForm()
      : this.initUpdateForm();

  private initCreateForm() {
    this.form = this.formBuilder.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required]],
      credits: ["", [Validators.required, Validators.min(0)]]
    });
  }

  private initUpdateForm() {
    this.form = this.formBuilder.group({
      firstName: [this.client.firstName, [Validators.required]],
      lastName: [this.client.lastName, [Validators.required]],
      email: [this.client.email, [Validators.required, Validators.email]],
      phone: [this.client.phone, [Validators.required]],
      credits: [this.client.credits, [Validators.required, Validators.min(0)]],
    });
  }

  private createClient() {
    this.clientService.createClient(this.form.value).subscribe({
      next: (response: Client) => {
        this.client = Object.assign(new Client(), response);

        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Client is created successfully.",
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
          summary: "Error Creating Client",
          detail: error.message || "An unexpected error occurred.",
        });
      },
      complete: () => {
        this.loadingData = false;
      },
    });
  }

  private updateClient() {
    this.clientService.updateClient(this.client.id, this.form.value).subscribe({
      next: (response: Client) => {
        this.client = Object.assign(new Client(), response);

        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Client is updated successfully.",
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
          summary: "Error Updating Client",
          detail: error.message || "An unexpected error occurred.",
        });
      },
      complete: () => {
        this.loadingData = false;
      },
    });
  }

  private getUsers() {
    this.userService.getAllUsers().subscribe((response: User[]) => {
      this.users = response.map((x: User) => Object.assign(new User(), x));
    });
  }
}
