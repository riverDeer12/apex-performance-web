import {Component, Input, OnInit} from "@angular/core";
import {AppointmentService} from "./services/appointment.service";
import {Appointment} from "./models/appointment";
import {Button} from "primeng/button";
import {DialogFormComponent} from "../../components/dialog-form/dialog-form.component";
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogService} from "primeng/dynamicdialog";
import {CommonModule, DatePipe, formatDate} from "@angular/common";
import {ConfirmationService, MessageService} from "primeng/api";
import {TableModule} from "primeng/table";
import {DialogInfoComponent} from "../../components/dialog-info/dialog-info.component";
import {BusinessStatuses} from "../../constants/business-statuses";
import {AppointmentRequest} from "./models/appointment-request";

@Component({
    selector: "app-appointments",
    standalone: true,
    imports: [CommonModule, Button, DatePipe, TableModule],
    providers: [DialogService],
    templateUrl: "./appointments.component.html",
    styleUrl: "./appointments.component.scss",
})
export class AppointmentsComponent implements OnInit {
    @Input() isAdmin: boolean = true;

    appointments!: Appointment[];

    public get businessStatuses(): typeof BusinessStatuses {
        return BusinessStatuses;
    }

    constructor(
        private appointmentService: AppointmentService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private dialogService: DialogService,
    ) {
    }

    ngOnInit() {
        this.loadData();
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

    areActionsEnabled = (appointment: Appointment) =>
        this.isAdmin && appointment.status.name == BusinessStatuses.Pending ||
        appointment.status.name == BusinessStatuses.InProgress

    isStatusTextVisible = (appointment: Appointment) =>
        this.isAdmin && appointment.status.name != BusinessStatuses.Pending &&
        appointment.status.name != BusinessStatuses.InProgress;

    getTextColor = (appointment: Appointment) => {
        switch (appointment.status.name) {
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


    openCreateDialog() {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: "Add New Appointment",
            data: {
                contentType: EntityType.Appointment,
                formType: ActionType.Create,
                dialogId: "createAppointmentForm",
            },
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        });
    }

    openInfoDialog(appointment: Appointment) {
        this.dialogService.open(DialogInfoComponent, {
            header: "Details for: " + formatDate(appointment.startTime, "dd.MM.yyyy HH:mm", "en-US"),
            data: {
                contentType: EntityType.Appointment,
                data: appointment,
            },
        });
    }

    openUpdateDialog(appointment: Appointment) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header:
                "Update data for: " +
                formatDate(appointment.startTime, "dd.MM.yyyy HH:mm", "en-US"),
            data: {
                contentType: EntityType.Appointment,
                formType: ActionType.Update,
                dialogId: "updateAppointmentForm",
                data: appointment,
            },
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        });
    }

    confirmDelete(appointment: Appointment) {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to deactivate this appointment?',
            header: 'Confirm deletion of ' + formatDate(appointment.startTime, "dd.MM.yyyy HH:mm", "en-US"),
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Yes',
            },
            accept: () => {
                this.appointmentService.deleteAppointment(appointment.id)
                    .subscribe((response) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Appointment has been deactivated.'
                        });
                    }, error => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error deactivating appointment.'
                        });
                    });
            }
        });
    }

    approve(appointment: Appointment): void {
        this.appointmentService.approveAppointment(appointment.id).subscribe({
            next: (data) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Appointment has been approved.'
                });
                this.loadData();
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    decline(appointment: Appointment): void {
        this.appointmentService.declineAppointment(appointment.id).subscribe({
            next: (data) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Appointment has been declined.'
                });
                this.loadData();
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

}
