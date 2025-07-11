import {Component, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {TableModule} from "primeng/table";
import {DialogService} from "primeng/dynamicdialog";
import {EntityType} from "../../../../enums/entity-type";
import {DialogInfoComponent} from "../../../../components/dialog-info/dialog-info.component";
import {AppointmentRequest} from "../../models/appointment-request";
import {AppointmentRequestService} from "../../services/appointment-request.service";
import {Appointment} from '../../models/appointment';
import {MessageService} from 'primeng/api';
import { BusinessStatuses } from '../../../../constants/business-statuses';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-appointment-requests',
    imports: [
        CommonModule,
        Button,
        TableModule
    ],
    providers: [DialogService],
    templateUrl: './appointment-requests.component.html',
    styleUrl: './appointment-requests.component.scss'
})
export class AppointmentRequestsComponent implements OnInit {
    appointmentRequests!: AppointmentRequest[];

    public get businessStatuses(): typeof BusinessStatuses {
        return BusinessStatuses;
    }

    constructor(
        private appointmentRequestService: AppointmentRequestService,
        private messageService: MessageService,
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

    approve(appointmentRequest: AppointmentRequest): void {
        this.appointmentRequestService.approveAppointmentRequest(appointmentRequest.id).subscribe({
            next: (data) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Appointment Request has been approved.'
                });
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    decline(appointmentRequest: AppointmentRequest): void {
        this.appointmentRequestService.declineAppointmentRequest(appointmentRequest.id).subscribe({
            next: (data) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Appointment Request has been declined.'
                });
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
