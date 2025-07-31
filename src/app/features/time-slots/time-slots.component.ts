import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {HelperService} from "../../services/helper.service";
import {Table, TableModule} from "primeng/table";
import {DialogFormComponent} from "../../components/dialog-form/dialog-form.component";
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogInfoComponent} from "../../components/dialog-info/dialog-info.component";
import {TimeSlot} from "./models/time-slot";
import {TimeSlotService} from './services/time-slot.service';
import {Button, ButtonDirective} from "primeng/button";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-time-slots',
    imports: [
        CommonModule,
        Button,
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        TableModule
    ],
    providers: [DialogService],
    templateUrl: './time-slots.component.html',
    styleUrl: './time-slots.component.scss'
})
export class TimeSlotsComponent implements OnInit {
    @Input() timeSlots!: TimeSlot[];

    @ViewChild(`filter`) filter!: ElementRef;

    constructor(
        private timeSlotService: TimeSlotService,
        private dialogService: DialogService,
        private messageService: MessageService,
        private helperService: HelperService,
        private confirmationService: ConfirmationService,
    ) {
    }

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
            header: "Add New TimeSlot",
            data: {
                contentType: EntityType.TimeSlot,
                formType: ActionType.Create,
                dialogId: "createTimeSlotForm",
            },
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        });
    }

    openInfoDialog(timeSlot: TimeSlot) {
        this.dialogService.open(DialogInfoComponent, {
            header: "Details for: " + timeSlot.id,
            data: {
                contentType: EntityType.TimeSlot,
                data: timeSlot,
            },
        });
    }

    openUpdateDialog(timeSlot: TimeSlot) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: "Update data for: " + timeSlot.id,
            data: {
                contentType: EntityType.TimeSlot,
                formType: ActionType.Update,
                dialogId: "updateTimeSlotForm",
                data: timeSlot,
            },
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        });
    }

    confirmDelete(timeSlot: TimeSlot) {
        this.confirmationService.confirm({
            message: "Are you sure that you want to deactivate this time slot?",
            header: "Confirm deletion of " + timeSlot.id,
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
                this.timeSlotService.deleteTimeSlot(timeSlot.id).subscribe(
                    () => {
                        this.messageService.add({
                            severity: "success",
                            summary: "Success",
                            detail: "Time Slot has been deactivated.",
                        });
                    },
                    () => {
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: "Error deactivating Time Slot.",
                        });
                    },
                );
            },
        });
    }

    private loadData() {
        this.timeSlotService.getAllTimeSlots().subscribe((response: TimeSlot[]) => {
            this.timeSlots = response.map((x: TimeSlot) =>
                Object.assign(new TimeSlot(), x),
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
