import { Component, OnInit } from "@angular/core";
import { Timeline } from "primeng/timeline";
import { AppointmentService } from "./services/appointment.service";
import { Appointment } from "./models/appointment";
import { Button } from 'primeng/button';
import { DialogFormComponent } from '../../components/dialog-form/dialog-form.component';
import { EntityType } from '../../enums/entity-type';
import { ActionType } from '../../enums/action-type';
import { DialogService } from 'primeng/dynamicdialog';
import { Administrator } from '../administrators/models/administrator';

@Component({
  selector: "app-appointments",
  imports: [Timeline, Button],
  providers: [DialogService],
  templateUrl: "./appointments.component.html",
  styleUrl: "./appointments.component.scss",
})
export class AppointmentsComponent implements OnInit {
  appointments!: Appointment[];

  constructor(private appointmentService: AppointmentService,
              private dialogService: DialogService) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData(): void {
    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
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
      header: 'Add New Appointment',
      data: {
        contentType: EntityType.Appointment,
        formType: ActionType.Create,
        dialogId: 'createAppointmentForm'
      }
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    })
  }

  openUpdateDialog(appointment: Appointment) {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: 'Update data for: ' + appointment.id,
      data: {
        contentType: EntityType.Appointment,
        formType: ActionType.Update,
        dialogId: 'updateAppointmentForm',
        data: appointment
      }
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    })
  }
}
