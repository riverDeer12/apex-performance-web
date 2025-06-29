import {Component, Input, OnInit} from '@angular/core';
import {ActionType} from "../../../../enums/action-type";
import {Client} from "../../../clients/models/client";
import {RedirectType} from "../../../../enums/redirect-type";
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import {ValidationService} from "../../../../services/validation.service";
import {HelperService} from "../../../../services/helper.service";
import {ClientService} from "../../../clients/services/client.service";
import {MessageService} from "primeng/api";
import {Appointment} from "../../models/appointment";
import {AppointmentService} from "../../services/appointment.service";
import {Button} from "primeng/button";
import {NgIf} from "@angular/common";
import {MultiSelect} from "primeng/multiselect";
import {DatePicker} from 'primeng/datepicker';
import {DropdownModule} from 'primeng/dropdown';
import {Select} from 'primeng/select';
import {AppointmentType} from '../../models/appointment-type';
import {AppointmentTypeService} from '../../services/appointment-type.service';
import {Coach} from "../../../coaches/models/coach";
import {CoachService} from "../../../coaches/services/coach.service";

@Component({
    selector: "app-appointment-form",
    imports: [
        Button,
        NgIf,
        ReactiveFormsModule,
        MultiSelect,
        DatePicker,
        DropdownModule,
        Select,
    ],
    templateUrl: "./appointment-form.component.html",
    styleUrl: "./appointment-form.component.scss",
})
export class AppointmentFormComponent implements OnInit {
    @Input() type!: ActionType;
    @Input() appointment!: Appointment;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    clients!: Client[];
    coaches!: Coach[];
    appointmentTypes!: AppointmentType[];

    loadingData = false;

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private helperService: HelperService,
        private clientService: ClientService,
        private coachService: CoachService,
        private appointmentService: AppointmentService,
        private appointmentTypeService: AppointmentTypeService,
        private messageService: MessageService,
    ) {
    }

    ngOnInit(): void {
        this.initForm();
        this.getClients();
        this.getCoaches();
        this.getAppointmentTypes();
    }

    submit() {
        this.loadingData = true;

        if (this.form.invalid) {

            console.log(this.form.value);

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
            ? this.createAppointment()
            : this.updateAppointment();
    }

    private initForm = () =>
        this.type == ActionType.Create
            ? this.initCreateForm()
            : this.initUpdateForm();

    private initCreateForm() {
        this.form = this.formBuilder.group({
            startTime: ["", [Validators.required]],
            endTime: ["", [Validators.required]],
            type: ["", [Validators.required]],
            clients: ["", [Validators.required]],
            coaches: ["", [Validators.required]],
        });
    }

    private initUpdateForm() {
        this.form = this.formBuilder.group({
            startTime: [new Date(this.appointment.startTime), [Validators.required]],
            endTime: [new Date(this.appointment.endTime), [Validators.required]],
            type: [this.appointment.type.id, [Validators.required]],
            clients: [this.appointment.clients?.map(x => x.id), [Validators.required]],
            coaches: [this.appointment.coaches?.map(x => x.id), [Validators.required]],
        });
    }

    private createAppointment() {
        this.appointmentService.createAppointment(this.form.value).subscribe({
            next: (response: Appointment) => {
                this.appointment = Object.assign(new Appointment(), response);

                this.messageService.add({
                    severity: "success",
                    summary: "Success",
                    detail: "Appointment is created successfully.",
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
                    summary: "Error Creating Appointment",
                    detail: error.message || "An unexpected error occurred.",
                });
            },
            complete: () => {
                this.loadingData = false;
            },
        });
    }

    private updateAppointment() {
        this.appointmentService
            .updateAppointment(this.appointment.id, this.form.value)
            .subscribe({
                next: (response: Appointment) => {
                    this.appointment = Object.assign(new Appointment(), response);

                    this.messageService.add({
                        severity: "success",
                        summary: "Success",
                        detail: "Appointment is updated successfully.",
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
                        summary: "Error Updating Appointment",
                        detail: error.message || "An unexpected error occurred.",
                    });
                },
                complete: () => {
                    this.loadingData = false;
                },
            });
    }

    private getClients() {
        this.clientService.getAllClients().subscribe((response: Client[]) => {
            this.clients = response.map((x: Client) =>
                Object.assign(new Client(), x),
            );
        });
    }

    private getCoaches() {
        this.coachService.getAllCoaches().subscribe((response: Coach[]) => {
            this.coaches = response.map((x: Coach) =>
                Object.assign(new Coach(), x),
            );
        });
    }

    private getAppointmentTypes() {
        this.appointmentTypeService
            .getAllAppointmentTypes()
            .subscribe((response: AppointmentType[]) => {
                this.appointmentTypes = response.map((x: AppointmentType) =>
                    Object.assign(new AppointmentType(), x),
                );
            });
    }
}
