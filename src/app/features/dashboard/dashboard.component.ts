import {Component, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogService} from "primeng/dynamicdialog";
import {AuthenticationService} from "../authentication/services/authentication.service";
import {Appointment} from "../appointments/models/appointment";
import {AppointmentService} from "../appointments/services/appointment.service";
import {AppointmentsListComponent} from "../appointments/components/appointments-list/appointments-list.component";
import {AppointmentsStatus} from "../../shared/data-transfer-objects/appointments-status";
import {Roles} from "../../constants/roles";
import {
    AppointmentsRequestsListComponent
} from "../appointments/components/appointments-requests-list/appointments-requests-list.component";
import {AppointmentRequestService} from "../appointments/services/appointment-request.service";
import {AppointmentRequest} from "../appointments/models/appointment-request";
import {HelperService} from "../../services/helper.service";

@Component({
    selector: "app-dashboard",
    standalone: true,
    imports: [CommonModule, AppointmentsListComponent, AppointmentsRequestsListComponent],
    providers: [DialogService],
    templateUrl: "./dashboard.component.html",
    styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent {
    approvedAppointments!: Appointment[];
    pendingAppointments!: Appointment[];
    inProgressAppointments!: Appointment[];

    appointmentRequests!: AppointmentRequest[];

    userRole!: string;

    get showAppointmentRequests(): boolean {
        const loggedUserRoles = this.authenticationService.getLoggedUserRoles();
        return loggedUserRoles.includes(Roles.SuperAdmin) || loggedUserRoles.includes(Roles.Administrator);
    }

    constructor(
        private authenticationService: AuthenticationService,
        private appointmentRequestService: AppointmentRequestService,
        private appointmentService: AppointmentService,
        private helperService: HelperService
    ) {
        this.loadData();
        this.getDataStatus();
    }

    private getDataStatus() {
        this.helperService.getDataStatus().subscribe(data => {
            this.loadData();
        })
    }

    private loadData(): void {

        this.userRole = this.authenticationService.getUserRole();

        if (this.userRole == Roles.Administrator) {
            this.loadAdminAppointments();
            this.loadAppointmentRequests();
        } else if (this.userRole == Roles.Coach) {
            this.loadCoachAppointments();
        } else if (this.userRole == Roles.Client) {
            this.loadClientAppointments();
        }
    }

    private loadAppointmentRequests() {
        this.appointmentRequestService.getPendingAppointmentRequests().subscribe({
            next: (data: AppointmentRequest[]) => {
                this.appointmentRequests = data.map((x: AppointmentRequest) =>
                    Object.assign(new AppointmentRequest(), x),
                );
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    private loadAdminAppointments(): void {
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

    private loadClientAppointments(): void {
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

    private loadCoachAppointments(): void {
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
