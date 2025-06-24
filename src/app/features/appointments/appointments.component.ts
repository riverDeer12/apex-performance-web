import {Component, OnInit} from "@angular/core";
import {AppointmentService} from "./services/appointment.service";
import {Appointment} from "./models/appointment";
import {Button, ButtonDirective} from "primeng/button";
import {DialogFormComponent} from "../../components/dialog-form/dialog-form.component";
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogService} from "primeng/dynamicdialog";
import {DatePipe, formatDate} from "@angular/common";
import {ConfirmationService, MessageService} from "primeng/api";
import {TableModule} from "primeng/table";
import {BodyMeasurement} from "../body-measurements/models/body-measurement";
import {DialogInfoComponent} from "../../components/dialog-info/dialog-info.component";

@Component({
    selector: "app-appointments",
    standalone: true,
    imports: [Button, DatePipe, TableModule],
    providers: [DialogService],
    templateUrl: "./appointments.component.html",
    styleUrl: "./appointments.component.scss",
})
export class AppointmentsComponent implements OnInit {
    appointments!: Appointment[];

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

}
