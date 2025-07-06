import {Component, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {TableModule} from "primeng/table";
import {DialogService} from "primeng/dynamicdialog";
import {EntityType} from "../../../../enums/entity-type";
import {DialogInfoComponent} from "../../../../components/dialog-info/dialog-info.component";
import {AppointmentRequest} from "../../models/appointment-request";
import {AppointmentRequestService} from "../../services/appointment-request.service";
import {Appointment} from '../../models/appointment';

@Component({
    selector: 'app-appointment-requests',
    imports: [
        Button,
        TableModule
    ],
    providers: [DialogService],
    templateUrl: './appointment-requests.component.html',
    styleUrl: './appointment-requests.component.scss'
})
export class AppointmentRequestsComponent implements OnInit {
    appointmentRequests!: AppointmentRequest[];

    constructor(
        private appointmentRequestService: AppointmentRequestService,
        private dialogService: DialogService,
    ) {
    }

    ngOnInit() {
        this.loadData();
    }

    private loadData(): void {
        this.appointmentRequestService.getAppointmentRequests().subscribe({
            next: (data) => {
                this.appointmentRequests = data.map((x: AppointmentRequest) =>
                    Object.assign(new AppointmentRequest(), x),
                );
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    openInfoDialog(appointmentRequest: AppointmentRequest) {
        this.dialogService.open(DialogInfoComponent, {
            header: "Details for appointment request",
            data: {
                contentType: EntityType.AppointmentRequest,
                data: appointmentRequest,
            },
        });
    }

    openAppointmentInfo(appointment: Appointment) {
        this.dialogService.open(DialogInfoComponent, {
            header: "Details for appointment",
            data: {
                contentType: EntityType.Appointment,
                data: appointment,
            },
        });
    }
}
