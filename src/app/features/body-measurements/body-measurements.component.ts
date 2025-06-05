import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Button, ButtonDirective} from "primeng/button";
import {DatePipe} from "@angular/common";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {Table, TableModule} from "primeng/table";
import {Client} from "../clients/models/client";
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {HelperService} from "../../services/helper.service";
import {DialogFormComponent} from "../../components/dialog-form/dialog-form.component";
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogInfoComponent} from "../../components/dialog-info/dialog-info.component";
import {BodyMeasurement} from "./models/body-measurement";
import {BodyMeasurementService} from "./services/body-measurement.service";

@Component({
  selector: 'app-body-measurements',
  imports: [
    Button,
    ButtonDirective,
    DatePipe,
    IconField,
    InputIcon,
    InputText,
    TableModule
  ],
  providers: [DialogService],
  templateUrl: './body-measurements.component.html',
  styleUrl: './body-measurements.component.scss'
})
export class BodyMeasurementsComponent implements OnInit {
  @Input() bodyMeasurements!: BodyMeasurement[];

  @ViewChild(`filter`) filter!: ElementRef;

  constructor(
      private bodyMeasurementService: BodyMeasurementService,
      private dialogService: DialogService,
      private messageService: MessageService,
      private helperService: HelperService,
      private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.getDataStatus();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = "";
  }

  openCreateDialog() {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: "Add New Body Measurement",
      data: {
        contentType: EntityType.BodyMeasurement,
        formType: ActionType.Create,
        dialogId: "createBodyMeasurementForm",
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  openInfoDialog(client: Client) {
    this.dialogService.open(DialogInfoComponent, {
      header: "Details for: " + client.fullName,
      data: {
        contentType: EntityType.Client,
        data: client,
      },
    });
  }

  openUpdateDialog(bodyMeasurement: BodyMeasurement) {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: "Update data for: " + bodyMeasurement.id,
      data: {
        contentType: EntityType.BodyMeasurement,
        formType: ActionType.Update,
        dialogId: "updateBodyMeasurementForm",
        data: bodyMeasurement,
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  confirmDelete(bodyMeasurement: BodyMeasurement) {
    this.confirmationService.confirm({
      message: "Are you sure that you want to deactivate this Body Measurement?",
      header: "Confirm deletion of " + bodyMeasurement.id,
      closable: true,
      closeOnEscape: true,
      icon: "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: "No",
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: "Yes",
      },
      accept: () => {
        this.bodyMeasurementService.deleteBodyMeasurement(bodyMeasurement.id).subscribe(
            (response) => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Body Measurement has been deactivated.",
              });
            },
            (error) => {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Error deactivating Body Measurement.",
              });
            },
        );
      },
    });
  }

  private loadData() {
    this.bodyMeasurementService.getAllBodyMeasurements().subscribe((response: BodyMeasurement[]) => {
      this.bodyMeasurements = response.map((x: BodyMeasurement) =>
          Object.assign(new BodyMeasurement(), x),
      );
    });
  }

  private getDataStatus() {
    this.helperService.getDataStatus().subscribe((response: boolean) => {
      if (response) {
        this.loadData();
      }
    });
  }
}
