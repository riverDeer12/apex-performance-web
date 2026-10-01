import {Component, Input, OnInit} from '@angular/core';
import {Button} from "primeng/button";
import {TableModule} from "primeng/table";
import {DialogService} from "primeng/dynamicdialog";
import {EntityType} from "../../../../../enums/entity-type";
import {DialogInfoComponent} from "../../../../../shared/components/dialog-info/dialog-info.component";
import {AppointmentRequest} from "../../models/appointment-request";
import {AppointmentRequestService} from "../../services/appointment-request.service";
import {Appointment} from '../../../models/appointment';
import {MessageService} from 'primeng/api';
import {BusinessStatuses} from '../../../../../constants/business-statuses';
import {CommonModule} from '@angular/common';
import {TranslationService} from '../../../../../i18n/translation.service';
import {TranslatePipe} from '../../../../../i18n/translate.pipe';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../../../authentication/services/authentication.service';
import {Roles} from '../../../../../constants/roles';

@Component({
    selector: 'app-appointment-requests',
    imports: [
        CommonModule,
        Button,
        TableModule,
        TranslatePipe
    ],
    providers: [DialogService],
    templateUrl: './appointment-requests.component.html',
    styleUrl: './appointment-requests.component.scss'
})
export class AppointmentRequestsComponent implements OnInit {
    @Input() isAdmin: boolean = true;
    appointmentRequests!: AppointmentRequest[];

    // Request type shown on this page (CancelationRequest or JoinRequest),
    // all types are shown when the route does not set it.
    requestType?: string;

    public get businessStatuses(): typeof BusinessStatuses {
        return BusinessStatuses;
    }

    constructor(
        private appointmentRequestService: AppointmentRequestService,
        private messageService: MessageService,
        private dialogService: DialogService,
        private translationService: TranslationService,
        private authenticationService: AuthenticationService,
        route: ActivatedRoute,
    ) {
        this.requestType = route.snapshot.data['requestType'];
        // Only coaches and administrators can approve or decline requests,
        // clients see the status of requests they have sent.
        this.isAdmin = this.authenticationService.getUserRole() !== Roles.Client;
    }

    statusLabel = (appointmentRequest: AppointmentRequest) =>
        this.translationService.t('businessStatuses.' + appointmentRequest.status.name)

    ngOnInit() {
        this.loadData();
    }

    areActionsEnabled = (appointmentRequest: AppointmentRequest) =>
        this.isAdmin && (appointmentRequest.status.name == BusinessStatuses.Pending ||
            appointmentRequest.status.name == BusinessStatuses.InProgress)

    getTextColor = (appointmentRequest: AppointmentRequest) => {
        switch (appointmentRequest.status.name) {
            case BusinessStatuses.Approved:
                return "text-green-500";
            case BusinessStatuses.Declined:
                return "text-red-500";
            case BusinessStatuses.Canceled:
                return "text-red-500";
            default:
                return "";
        }
    }

    isStatusTextVisible = (appointmentRequest: AppointmentRequest) =>
        appointmentRequest.status.name != BusinessStatuses.Pending &&
        appointmentRequest.status.name != BusinessStatuses.InProgress;

    approve(appointmentRequest: AppointmentRequest): void {
        this.appointmentRequestService.approveAppointmentRequest(appointmentRequest.id).subscribe({
            next: (data) => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translationService.t('common.success'),
                    detail: this.translationService.t('appointmentRequests.approvedDetail')
                });
                this.loadData();
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
                    summary: this.translationService.t('common.success'),
                    detail: this.translationService.t('appointmentRequests.declinedDetail')
                });
                this.loadData();
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    openInfoDialog(appointmentRequest: AppointmentRequest) {
        this.dialogService.open(DialogInfoComponent, {
            header: this.translationService.t('appointmentRequests.detailsForRequest'),
            data: {
                contentType: EntityType.AppointmentRequest,
                data: appointmentRequest,
            },
        });
    }

    openAppointmentInfo(appointment: Appointment) {
        this.dialogService.open(DialogInfoComponent, {
            header: this.translationService.t('appointmentRequests.detailsForAppointment'),
            data: {
                contentType: EntityType.Appointment,
                data: appointment,
            },
        });
    }

    private loadData(): void {
        this.appointmentRequestService.getAppointmentRequests().subscribe({
            next: (data) => {
                this.appointmentRequests = data
                    .filter((x: AppointmentRequest) => !this.requestType || x.type.name == this.requestType)
                    .map((x: AppointmentRequest) => Object.assign(new AppointmentRequest(), x));
            },
            error: (err) => {
                console.error(err);
            },
        });
    }
}
