import {Component, Input} from '@angular/core';
import {AppointmentRequest} from '../../models/appointment-request';
import {Button} from "primeng/button";
import {DatePipe, NgIf} from "@angular/common";
import {TableModule} from "primeng/table";
import {AppointmentRequestService} from '../../services/appointment-request.service';
import {MessageService} from 'primeng/api';

@Component({
    selector: 'app-appointments-requests-list',
    imports: [
        Button,
        DatePipe,
        TableModule,
        NgIf
    ],
    templateUrl: './appointments-requests-list.component.html',
    styleUrl: './appointments-requests-list.component.scss'
})
export class AppointmentsRequestsListComponent {
    @Input() appointmentRequests!: AppointmentRequest[];

    constructor(private appointmentRequestService: AppointmentRequestService,
                private messageService: MessageService
    ) {
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
}
