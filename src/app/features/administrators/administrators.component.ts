import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Button, ButtonDirective} from 'primeng/button';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {Table, TableModule} from 'primeng/table';
import {Administrator} from './models/administrator';
import {AdministratorService} from './services/administrator.service';
import {DialogFormComponent} from '../../components/dialog-form/dialog-form.component';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DialogService} from 'primeng/dynamicdialog';
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogInfoComponent} from "../../components/dialog-info/dialog-info.component";
import {DatePipe} from "@angular/common";
import {HelperService} from "../../services/helper.service";

@Component({
    selector: 'app-administrators',
    imports: [ButtonDirective, IconField, InputIcon, InputText, TableModule, Button, DatePipe],
    standalone: true,
    providers: [DialogService],
    templateUrl: './administrators.component.html',
    styleUrl: './administrators.component.scss'
})
export class AdministratorsComponent {
    @Input() administrators!: Administrator[];

    @ViewChild(`filter`) filter!: ElementRef;

    constructor(private administratorService: AdministratorService,
                private dialogService: DialogService,
                private messageService: MessageService,
                private helperService: HelperService,
                private confirmationService: ConfirmationService) {
    }

    ngOnInit(): void {
        this.loadData();
        this.getDataStatus();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    openCreateDialog() {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: 'Add New Administrator',
            data: {
                contentType: EntityType.Administrator,
                formType: ActionType.Create,
                dialogId: 'createAdministratorForm'
            }
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        })
    }

    openInfoDialog(administrator: Administrator) {
        this.dialogService.open(DialogInfoComponent, {
            header: 'Details for: ' + administrator.id,
            data: {
                contentType: EntityType.Administrator,
                data: administrator
            }
        });
    }

    openUpdateDialog(administrator: Administrator) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: 'Update data for: ' + administrator.id,
            data: {
                contentType: EntityType.Administrator,
                formType: ActionType.Update,
                dialogId: 'updateAdministratorForm',
                data: administrator
            }
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        })
    }

    confirmDelete(administrator: Administrator) {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to deactivate this administrator?',
            header: 'Confirm deletion of ' + administrator.id,
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Yes',
            },
            accept: () => {
                this.administratorService.deleteAdministrator(administrator.id)
                    .subscribe((response) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Administrator has been deactivated.'
                        });
                    }, error => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error deactivating administrator.'
                        });
                    });
            }
        });
    }

    private loadData() {
        this.administratorService.getAllAdministrators().subscribe((response: Administrator[]) => {
            this.administrators = response.map((x: Administrator) => Object.assign(new Administrator(), x));
        });
    }

    private getDataStatus() {
        this.helperService.getDataStatus().subscribe((response: boolean) => {
            if (response) {
                this.loadData()
            }
        })
    }
}
