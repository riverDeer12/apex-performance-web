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
import {TranslationService} from "../../i18n/translation.service";
import {TranslatePipe} from "../../i18n/translate.pipe";

@Component({
    selector: 'app-coaches',
    imports: [
        Button,
        ButtonDirective,
        DatePipe,
        IconField,
        InputIcon,
        InputText,
        TableModule,
        TranslatePipe
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
        private translationService: TranslationService,
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
            header: this.translationService.t("coaches.addNew"),
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
            header: this.translationService.t("coaches.detailsFor") + " " + coach.fullName,
            data: {
                contentType: EntityType.Coach,
                data: coach,
            },
        });
    }

    openUpdateDialog(coach: Coach) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t("coaches.updateDataFor") + " " + coach.fullName,
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
            message: this.translationService.t("coaches.confirmDeactivate"),
            header: this.translationService.t("common.confirmDeletionHeader") + " " + coach.id,
            closable: true,
            closeOnEscape: true,
            icon: "pi pi-exclamation-triangle",
            rejectButtonProps: {
                label: this.translationService.t("common.no"),
                severity: "secondary",
                outlined: true,
            },
            acceptButtonProps: {
                label: this.translationService.t("common.yes"),
            },
            accept: () => {
                this.coachService.deleteCoach(coach.id).subscribe(
                    (response) => {
                        this.messageService.add({
                            severity: "success",
                            summary: this.translationService.t("common.success"),
                            detail: this.translationService.t("coaches.deactivatedDetail"),
                        });

                        this.loadData();
                    },
                    (error) => {
                        this.messageService.add({
                            severity: "error",
                            summary: this.translationService.t("common.error"),
                            detail: this.translationService.t("coaches.deactivateErrorDetail"),
                        });
                    },
                );
            },
        });
    }

    private loadData() {
        this.coachService.getAllCoaches().subscribe((response: Coach[]) => {
            this.coaches = response
                .filter((x: Coach) => !x.isDeleted)
                .map((x: Coach) => Object.assign(new Coach(), x));
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
