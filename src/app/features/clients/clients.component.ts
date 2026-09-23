import {Component, ElementRef, Input, ViewChild} from "@angular/core";
import {Button, ButtonDirective} from "primeng/button";
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {HelperService} from "../../shared/services/helper.service";
import {Table, TableModule} from "primeng/table";
import {DialogFormComponent} from "../../shared/components/dialog-form/dialog-form.component";
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogInfoComponent} from "../../shared/components/dialog-info/dialog-info.component";
import {ClientService} from "./services/client.service";
import {Client} from "./models/client";
import { CommonModule, DatePipe } from "@angular/common";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {AuthenticationService} from "../authentication/services/authentication.service";
import {TranslationService} from "../../i18n/translation.service";
import {TranslatePipe} from "../../i18n/translate.pipe";

@Component({
    selector: "app-clients",
    imports: [
        CommonModule,
        Button,
        DatePipe,
        TableModule,
        IconField,
        InputIcon,
        InputText,
        ButtonDirective,
        TranslatePipe,
    ],
    providers: [DialogService],
    templateUrl: "./clients.component.html",
    styleUrl: "./clients.component.scss",
})
export class ClientsComponent {
    userRole!: string;

    @Input() clients!: Client[];

    @ViewChild(`filter`) filter!: ElementRef;

    constructor(
        private clientService: ClientService,
        private dialogService: DialogService,
        private messageService: MessageService,
        private helperService: HelperService,
        private authenticationService: AuthenticationService,
        private confirmationService: ConfirmationService,
        private translationService: TranslationService,
    ) {
        this.userRole = this.authenticationService.getUserRole();
    }

    ngOnInit() {
        this.loadData();
        this.getDataStatus();

    }

    private loadData(): void {
        this.clientService.getClients().subscribe((response: Client[]) => {
            this.clients = response.map((x: Client) =>
                Object.assign(new Client(), x),
            );
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
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t("clients.addNew"),
            data: {
                contentType: EntityType.Client,
                formType: ActionType.Create,
                dialogId: "createClientForm",
            },
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        });
    }

    openInfoDialog(client: Client) {
        this.dialogService.open(DialogInfoComponent, {
            header: this.translationService.t("clients.detailsFor") + " " + client.fullName,
            data: {
                contentType: EntityType.Client,
                data: client,
            },
        });
    }

    openUpdateDialog(client: Client) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t("clients.updateDataFor") + " " + client.fullName,
            data: {
                contentType: EntityType.Client,
                formType: ActionType.Update,
                dialogId: "updateClientForm",
                data: client,
            },
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        });
    }

    confirmDelete(client: Client) {
        this.confirmationService.confirm({
            message: this.translationService.t("clients.confirmDeactivate"),
            header: this.translationService.t("common.confirmDeletionHeader") + " " + client.id,
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
                this.clientService.deleteClient(client.id).subscribe(
                    (response) => {
                        this.messageService.add({
                            severity: "success",
                            summary: this.translationService.t("common.success"),
                            detail: this.translationService.t("clients.deactivatedDetail"),
                        });

                        this.loadData();
                    },
                    (error) => {
                        this.messageService.add({
                            severity: "error",
                            summary: this.translationService.t("common.error"),
                            detail: this.translationService.t("clients.deactivateErrorDetail"),
                        });
                    },
                );
            },
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
