import {Component, Input, OnInit} from "@angular/core";
import {Button} from "primeng/button";
import {InputText} from "primeng/inputtext";
import {NgIf} from "@angular/common";
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import {ActionType} from "../../../../enums/action-type";
import {RedirectType} from "../../../../enums/redirect-type";
import {ValidationService} from "../../../../shared/services/validation.service";
import {HelperService} from "../../../../shared/services/helper.service";
import {MessageService} from "primeng/api";
import {Client} from "../../models/client";
import {ClientService} from "../../services/client.service";
import {Coach} from "../../../coaches/models/coach";
import {CoachService} from "../../../coaches/services/coach.service";
import {MultiSelect} from "primeng/multiselect";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import {Roles} from "../../../../constants/roles";

@Component({
    selector: "app-client-form",
    standalone: true,
    imports: [Button, InputText, NgIf, ReactiveFormsModule, MultiSelect],
    templateUrl: "./client-form.component.html",
    styleUrl: "./client-form.component.scss",
})
export class ClientFormComponent implements OnInit {
    @Input() type!: ActionType;
    @Input() client!: Client;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    userRole!: string;

    form!: FormGroup;

    coaches!: Coach[];

    loadingData = false;

    get userRoles(): typeof Roles {
        return Roles;
    }

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private helperService: HelperService,
        private clientService: ClientService,
        private coachService: CoachService,
        private authenticationService: AuthenticationService,
        private messageService: MessageService,
    ) {
        this.userRole = this.authenticationService.getUserRole();
    }

    ngOnInit() {
        this.initForm();
        this.loadData();
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

    private loadData(): void {
        if (this.userRole == Roles.Administrator) {
            this.getAllCoaches();
        } else {
            this.setCoach();
        }
    }

    private setCoach() {
        this.coachService.getCurrentCoachId().subscribe({
            next: coachId => {
                this.form.controls["coaches"].setValue([coachId]);
            }
        })
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
            credits: ["", [Validators.required]],
            coaches: [[]]
        });
    }

    private initUpdateForm() {
        this.form = this.formBuilder.group({
            firstName: [this.client.firstName, [Validators.required]],
            lastName: [this.client.lastName, [Validators.required]],
            email: [this.client.email, [Validators.required, Validators.email]],
            phone: [this.client.phone, [Validators.required]],
            credits: [this.client.credits, [Validators.required]],
            coaches: [this.client.coaches?.map(x => x.id)]
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

    private getAllCoaches() {
        this.coachService.getAllCoaches().subscribe((response: Coach[]) => {
            this.coaches = response;
        });
    }
}
