import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {HelperService} from "../../shared/services/helper.service";
import {Table, TableModule} from "primeng/table";
import {DialogFormComponent} from "../../shared/components/dialog-form/dialog-form.component";
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogInfoComponent} from "../../shared/components/dialog-info/dialog-info.component";
import {Coach} from "./models/coach";
import {CoachService} from "./services/coach.service";
import {Button, ButtonDirective} from "primeng/button";
import {DatePipe} from "@angular/common";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";

@Component({
    selector: 'app-coaches',
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
    templateUrl: './coaches.component.html',
    styleUrl: './coaches.component.scss'
})
export class CoachesComponent implements OnInit {
    @Input() coaches!: Coach[];

    @ViewChild(`filter`) filter!: ElementRef;

    constructor(
        private coachService: CoachService,
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
            header: "Add New Coach",
            data: {
                contentType: EntityType.Coach,
                formType: ActionType.Create,
                dialogId: "createCoachForm",
            },
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        });
    }

    openInfoDialog(coach: Coach) {
        this.dialogService.open(DialogInfoComponent, {
            header: "Details for: " + coach.fullName,
            data: {
                contentType: EntityType.Coach,
                data: coach,
            },
        });
    }

    openUpdateDialog(coach: Coach) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: "Update data for: " + coach.fullName,
            data: {
                contentType: EntityType.Coach,
                formType: ActionType.Update,
                dialogId: "updateCoachForm",
                data: coach,
            },
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        });
    }

    confirmDelete(coach: Coach) {
        this.confirmationService.confirm({
            message: "Are you sure that you want to deactivate this coach?",
            header: "Confirm deletion of " + coach.id,
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
                this.coachService.deleteCoach(coach.id).subscribe(
                    (response) => {
                        this.messageService.add({
                            severity: "success",
                            summary: "Success",
                            detail: "Coach has been deactivated.",
                        });

                        this.loadData();
                    },
                    (error) => {
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: "Error deactivating coach.",
                        });
                    },
                );
            },
        });
    }

    private loadData() {
        this.coachService.getAllCoaches().subscribe((response: Coach[]) => {
            this.coaches = response.map((x: Coach) =>
                Object.assign(new Coach(), x),
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
