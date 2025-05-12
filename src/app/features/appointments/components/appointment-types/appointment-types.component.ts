import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { DialogFormComponent } from '../../../../components/dialog-form/dialog-form.component';
import { EntityType } from '../../../../enums/entity-type';
import { ActionType } from '../../../../enums/action-type';
import { AppointmentType } from '../../models/appointment-type';
import { AppointmentTypeService } from '../../services/appointment-type.service';

@Component({
  selector: 'app-appointment-types',
  imports: [],
  templateUrl: './appointment-types.component.html',
  styleUrl: './appointment-types.component.scss'
})
export class AppointmentTypesComponent implements OnInit {
  appointmentTypes!: AppointmentType[];

  constructor(private appointmentTypeService: AppointmentTypeService,
              private dialogService: DialogService) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData(): void {
    this.appointmentTypeService.getAllAppointmentTypes().subscribe({
      next: (data) => {
        this.appointmentTypes = data.map((x: AppointmentType) =>
            Object.assign(new AppointmentType(), x),
        );
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: 'Add New Appointment Type',
      data: {
        contentType: EntityType.AppointmentType,
        formType: ActionType.Create,
        dialogId: 'createAppointmentTypeForm'
      }
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    })
  }

  openUpdateDialog(appointmentType: AppointmentType) {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: 'Update data for: ' + appointmentType.id,
      data: {
        contentType: EntityType.AppointmentType,
        formType: ActionType.Update,
        dialogId: 'updateAppointmentTypeForm',
        data: appointmentType
      }
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    })
  }
}
