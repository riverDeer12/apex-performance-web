import {Component, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogService} from "primeng/dynamicdialog";
import {AuthenticationService} from "../authentication/services/authentication.service";
import {Appointment} from "../appointments/models/appointment";
import {AppointmentService} from "../appointments/services/appointment.service";
import { MessageService } from "primeng/api";

@Component({
    selector: "app-dashboard",
    standalone: true,
    imports: [CommonModule],
    providers: [DialogService],
    templateUrl: "./dashboard.component.html",
    styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
    isAdmin!: boolean;

    appointments!: Appointment[];

    constructor(
        private authenticationService: AuthenticationService,
        private messageService: MessageService,
        private appointmentService: AppointmentService
    ) {
        this.isAdmin = this.authenticationService.validateUserRole();
    }

    ngOnInit() {

    }

    private loadData(): void {
        this.appointmentService.getAllAppointments().subscribe({
            next: (data: Appointment[]) => {
                this.appointments = data.map((x: Appointment) =>
                    Object.assign(new Appointment(), x),
                );
            },
            error: (err) => {
                console.error(err);
            },
        });
    }
}
