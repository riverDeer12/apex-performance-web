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
import {DatePipe} from "@angular/common";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {Roles} from "../../constants/roles";
import {AuthenticationService} from "../authentication/services/authentication.service";

@Component({
    selector: "app-clients",
    imports: [
        Button,
        DatePipe,
        TableModule,
        IconField,
        InputIcon,
        InputText,
        ButtonDirective,
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
            header: "Add New Client",
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
            header: "Details for: " + client.fullName,
            data: {
                contentType: EntityType.Client,
                data: client,
            },
        });
    }

    openUpdateDialog(client: Client) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: "Update data for: " + client.fullName,
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
            message: "Are you sure that you want to deactivate this client?",
            header: "Confirm deletion of " + client.id,
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
                this.clientService.deleteClient(client.id).subscribe(
                    (response) => {
                        this.messageService.add({
                            severity: "success",
                            summary: "Success",
                            detail: "Client has been deactivated.",
                        });

                        this.loadData();
                    },
                    (error) => {
                        this.messageService.add({
                            severity: "error",
                            summary: "Error",
                            detail: "Error deactivating client.",
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
