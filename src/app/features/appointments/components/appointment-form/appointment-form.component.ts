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
import {DropdownModule} from 'primeng/dropdown';
import {Select} from 'primeng/select';
import {AppointmentType} from '../../models/appointment-type';
import {AppointmentTypeService} from '../../services/appointment-type.service';
import {Coach} from "../../../coaches/models/coach";
import {CoachService} from "../../../coaches/services/coach.service";
import {TimeSlotService} from "../../../time-slots/services/time-slot.service";
import {TimeSlot} from "../../../time-slots/models/time-slot";
import {DatePicker} from "primeng/datepicker";
import {DateExtensions} from "../../../../shared/extensions/date-extensions";
import {Roles} from "../../../../constants/roles";
import {AuthenticationService} from '../../../authentication/services/authentication.service';

@Component({
    selector: "app-appointment-form",
    imports: [
        Button,
        NgIf,
        ReactiveFormsModule,
        MultiSelect,
        DropdownModule,
        Select,
        DatePicker,
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

    userRole!: string;

    form!: FormGroup;

    clients!: Client[];
    coaches!: Coach[];
    appointmentTypes!: AppointmentType[];

    timeSlots!: TimeSlot[];

    loadingData = false;

    today = new Date();

    get userRoles(): typeof Roles {
        return Roles;
    }

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private helperService: HelperService,
        private clientService: ClientService,
        private timeSlotService: TimeSlotService,
        private coachService: CoachService,
        private appointmentService: AppointmentService,
        private appointmentTypeService: AppointmentTypeService,
        private messageService: MessageService,
        private authenticationService: AuthenticationService
    ) {
        this.userRole = this.authenticationService.getUserRole();
    }

    ngOnInit(): void {
        this.initCreateForm();
        this.initFormData();
    }

    submit() {
        this.loadingData = true;

        this.setAppointmentTime();

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

        this.createAppointment();
    }

    getDataForSelectedCoaches(): void {

        this.loadingData = true;

        if (this.form.controls["coaches"].invalid || this.form.controls["day"].invalid) {
            this.messageService.add({
                severity: "warn",
                summary: "Incomplete or incorrect data",
                detail: "Please select appointment day.",
            });

            this.loadingData = false;

            return;
        } else {
            const payload = {
                coaches: this.form.controls["coaches"].value,
                day: new Date(this.form.controls["day"].value).getDay()
            };

            this.timeSlotService.getTimeSlotsByCoachId(payload).subscribe((response: TimeSlot[]) => {
                this.timeSlots = response.map((x: TimeSlot) =>
                    Object.assign(new TimeSlot(), x),
                );
            });

            if(this.userRole != Roles.Coach) {
                this.clientService.getCoachesClients(payload).subscribe((response: Client[]) => {
                    this.clients = response.map((x: Client) =>
                        Object.assign(new Client(), x),
                    );
                })
            }
        }
    }

    private initFormData() {

        this.getAllAppointmentTypes();

        switch (this.userRole) {
            case Roles.Administrator:
                this.getAllClients();
                this.getAllCoaches();
                break;
            case Roles.Client:
                this.getClientCoaches();
                break;
            case Roles.Coach:
                this.getCoachClients();
                this.setCoach();
                break;
            default:
                break;
        }
    }

    private setCoach() {
        this.coachService.getCurrentCoachId().subscribe({
            next: coachId => {
                this.form.controls["coaches"].setValue([coachId]);
            }
        })
    }

    private initCreateForm() {
        this.form = this.formBuilder.group({
            day: [null, [Validators.required]],
            startTime: [null, [Validators.required]],
            endTime: [null, [Validators.required]],
            timeSlot: [null, [Validators.required]],
            type: ["", [Validators.required]],
            clients: ["", [Validators.required]],
            coaches: ["", [Validators.required]],
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

    private getCoachClients() {
        this.clientService.getCoachClients().subscribe((response: Client[]) => {
            this.clients = response.map((x: Client) =>
                Object.assign(new Client(), x),
            );
        });
    }

    private getAllClients() {
        this.clientService.getAllClients().subscribe((response: Client[]) => {
            this.clients = response.map((x: Client) =>
                Object.assign(new Client(), x),
            );
        });
    }

    private getAllCoaches() {
        this.coachService.getAllCoaches().subscribe((response: Coach[]) => {
            this.coaches = response.map((x: Coach) =>
                Object.assign(new Coach(), x),
            );
        });
    }

    private getClientCoaches() {
        this.coachService.getClientCoaches().subscribe((response: Coach[]) => {
            this.coaches = response.map((x: Coach) =>
                Object.assign(new Coach(), x),
            );
        });
    }

    private getAllAppointmentTypes() {
        this.appointmentTypeService
            .getAllAppointmentTypes()
            .subscribe((response: AppointmentType[]) => {
                this.appointmentTypes = response.map((x: AppointmentType) =>
                    Object.assign(new AppointmentType(), x),
                );
            });
    }

    private setAppointmentTime() {
        const timeSlot = this.timeSlots.find(x => x.id === this.form.controls['timeSlot'].value) as TimeSlot;

        const day = new Date(this.form.controls['day'].value);

        const startTime = DateExtensions.addTimeToDate(day, timeSlot.startTime.toString());
        const endTime = DateExtensions.addTimeToDate(day, timeSlot.endTime.toString());

        this.form.controls['startTime'].setValue(startTime);
        this.form.controls['endTime'].setValue(endTime);
    }
}
