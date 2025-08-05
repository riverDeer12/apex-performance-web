import {Component, Input} from '@angular/core';
import {AppointmentRequest} from '../../models/appointment-request';
import {Button} from "primeng/button";
import {DatePipe} from "@angular/common";
import {TableModule} from "primeng/table";
import {AppointmentRequestService} from '../../services/appointment-request.service';
import {MessageService} from 'primeng/api';
import { HelperService } from '../../../../services/helper.service';

@Component({
    selector: 'app-appointments-requests-list',
    imports: [
        Button,
        DatePipe,
        TableModule
    ],
    templateUrl: './appointments-requests-list.component.html',
    styleUrl: './appointments-requests-list.component.scss'
})
export class AppointmentsRequestsListComponent {
    @Input() appointmentRequests!: AppointmentRequest[];

    constructor(private appointmentRequestService: AppointmentRequestService,
                private messageService: MessageService,
                private helperService: HelperService
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

                this.helperService.triggerDataRefresh(true);
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

                this.helperService.triggerDataRefresh(true);
            },
            error: (err) => {
                console.error(err);
            },
        });
    }
}
