import {Component, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogService} from "primeng/dynamicdialog";
import {AuthenticationService} from "../authentication/services/authentication.service";
import {Appointment} from "../appointments/models/appointment";
import {AppointmentService} from "../appointments/services/appointment.service";
import {MessageService} from "primeng/api";
import {AppointmentsListComponent} from "../appointments/components/appointments-list/appointments-list.component";
import {AppointmentsStatus} from "../../shared/data-transfer-objects/appointments-status";
import {Roles} from "../../constants/roles";

@Component({
    selector: "app-dashboard",
    standalone: true,
    imports: [CommonModule, AppointmentsListComponent],
    providers: [DialogService],
    templateUrl: "./dashboard.component.html",
    styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
    isAdmin!: boolean;

    approvedAppointments!: Appointment[];
    pendingAppointments!: Appointment[];
    inProgressAppointments!: Appointment[];

    constructor(
        private authenticationService: AuthenticationService,
        private messageService: MessageService,
        private appointmentService: AppointmentService
    ) {
        this.isAdmin = this.authenticationService.validateUserRole();
    }

    ngOnInit() {
        this.loadData();
    }

    private loadData(): void {

        const userRoles = this.authenticationService.getLoggedUserRoles();

        if ((userRoles.includes(Roles.Administrator) || userRoles.includes(Roles.SuperAdmin))) {
            this.loadAdminData();
        } else if (userRoles.includes(Roles.Coach)) {
            this.loadCoachData();
        } else if (userRoles.includes(Roles.Client)) {
            this.loadClientData();
        }
    }

    private loadAdminData(): void {
        this.appointmentService.getAllAppointmentsStatus().subscribe({
            next: (data: AppointmentsStatus) => {
                this.approvedAppointments = data.approvedAppointments.map((x: Appointment) =>
                    Object.assign(new Appointment(), x),
                );

                this.pendingAppointments = data.pendingAppointments.map((x: Appointment) =>
                    Object.assign(new Appointment(), x),
                );

                this.inProgressAppointments = data.inProgressAppointments.map((x: Appointment) =>
                    Object.assign(new Appointment(), x),
                );
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    private loadClientData(): void {
        this.appointmentService.getClientAppointments().subscribe({
            next: (data: AppointmentsStatus) => {
                this.approvedAppointments = data.approvedAppointments.map((x: Appointment) =>
                    Object.assign(new Appointment(), x),
                );

                this.pendingAppointments = data.pendingAppointments.map((x: Appointment) =>
                    Object.assign(new Appointment(), x),
                );

                this.inProgressAppointments = data.inProgressAppointments.map((x: Appointment) =>
                    Object.assign(new Appointment(), x),
                );
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    private loadCoachData(): void {
        this.appointmentService.getCoachAppointments().subscribe({
            next: (data: AppointmentsStatus) => {
                this.approvedAppointments = data.approvedAppointments.map((x: Appointment) =>
                    Object.assign(new Appointment(), x),
                );

                this.pendingAppointments = data.pendingAppointments.map((x: Appointment) =>
                    Object.assign(new Appointment(), x),
                );

                this.inProgressAppointments = data.inProgressAppointments.map((x: Appointment) =>
                    Object.assign(new Appointment(), x),
                );
            },
            error: (err: any) => {
                console.error(err);
            }
        })
    }
}
