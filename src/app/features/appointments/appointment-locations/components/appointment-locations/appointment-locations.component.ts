import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {CommonModule} from "@angular/common";
import {Button, ButtonDirective} from "primeng/button";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {Table, TableModule} from "primeng/table";
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {DialogFormComponent} from "../../../../../shared/components/dialog-form/dialog-form.component";
import {EntityType} from "../../../../../enums/entity-type";
import {ActionType} from "../../../../../enums/action-type";
import {HelperService} from "../../../../../shared/services/helper.service";
import {TranslationService} from "../../../../../i18n/translation.service";
import {TranslatePipe} from "../../../../../i18n/translate.pipe";
import {AppointmentLocation, getNavigationUrl} from "../../models/appointment-location";
import {AppointmentLocationService} from "../../services/appointment-location.service";

@Component({
    selector: "app-appointment-locations",
    imports: [CommonModule, Button, ButtonDirective, IconField, InputIcon, InputText, TableModule, TranslatePipe],
    providers: [DialogService],
    templateUrl: "./appointment-locations.component.html",
    styleUrl: "./appointment-locations.component.scss",
})
export class AppointmentLocationsComponent implements OnInit {
    appointmentLocations!: AppointmentLocation[];

    @ViewChild(`filter`) filter!: ElementRef;

    readonly navigationUrl = getNavigationUrl;

    constructor(
        private appointmentLocationService: AppointmentLocationService,
        private dialogService: DialogService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private helperService: HelperService,
        private translationService: TranslationService,
    ) {
    }

    ngOnInit(): void {
        this.loadData();

        this.helperService.getDataStatus().subscribe((response: boolean) => {
            if (response) this.loadData();
        });
    }

    private loadData(): void {
        this.appointmentLocationService.getAppointmentLocations().subscribe((response: AppointmentLocation[]) => {
            this.appointmentLocations = response.map(x => Object.assign(new AppointmentLocation(), x));
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, "contains");
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = "";
    }

    openCreateDialog() {
        this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t("appointmentLocations.addNew"),
            data: {
                contentType: EntityType.AppointmentLocation,
                formType: ActionType.Create,
                dialogId: "createAppointmentLocationForm",
            },
        }).onClose.subscribe(() => this.loadData());
    }

    openUpdateDialog(location: AppointmentLocation) {
        this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t("appointmentLocations.updateDataFor") + " " + location.name,
            data: {
                contentType: EntityType.AppointmentLocation,
                formType: ActionType.Update,
                dialogId: "updateAppointmentLocationForm",
                data: location,
            },
        }).onClose.subscribe(() => this.loadData());
    }

    confirmDelete(location: AppointmentLocation) {
        this.confirmationService.confirm({
            message: this.translationService.t("appointmentLocations.confirmDelete"),
            header: this.translationService.t("common.confirmDeletionHeader") + " " + location.name,
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
                this.appointmentLocationService.deleteAppointmentLocation(location.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: "success",
                            summary: this.translationService.t("common.success"),
                            detail: this.translationService.t("appointmentLocations.deletedDetail"),
                        });

                        this.loadData();
                    },
                    error: () => {
                        this.messageService.add({
                            severity: "error",
                            summary: this.translationService.t("common.error"),
                            detail: this.translationService.t("appointmentLocations.deleteErrorDetail"),
                        });
                    },
                });
            },
        });
    }
}
