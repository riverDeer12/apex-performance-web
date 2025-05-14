import {Component, OnInit} from '@angular/core';
import {Appointment} from "../../../appointments/models/appointment";
import {AppointmentService} from "../../../appointments/services/appointment.service";
import {Button} from "primeng/button";
import {CommonModule, DatePipe} from "@angular/common";
import {Timeline} from "primeng/timeline";
import {DialogFormComponent} from "../../../../components/dialog-form/dialog-form.component";
import {EntityType} from "../../../../enums/entity-type";
import {ActionType} from "../../../../enums/action-type";
import {DialogService} from "primeng/dynamicdialog";
import {Card} from "primeng/card";
import {Divider} from "primeng/divider";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        Button,
        DatePipe,
        Timeline,
        Card,
        Divider
    ],
    providers: [DialogService],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})

export class DashboardComponent implements OnInit {
    appointments!: Appointment[];

    constructor(private appointmentService: AppointmentService,
                private dialogService: DialogService) {
    }

    ngOnInit() {
        this.loadData();
    }

    private loadData() {
        this.appointmentService.getAppointmentsByClient().subscribe({
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

    openUpdateDialog(appointment: Appointment) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: "Update data for: " + appointment.id,
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
}
