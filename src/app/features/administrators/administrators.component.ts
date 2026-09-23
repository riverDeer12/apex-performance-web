import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Button, ButtonDirective} from 'primeng/button';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {Table, TableModule} from 'primeng/table';
import {Administrator} from './models/administrator';
import {AdministratorService} from './services/administrator.service';
import {DialogFormComponent} from '../../shared/components/dialog-form/dialog-form.component';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DialogService} from 'primeng/dynamicdialog';
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogInfoComponent} from "../../shared/components/dialog-info/dialog-info.component";
import {DatePipe} from "@angular/common";
import {HelperService} from "../../shared/services/helper.service";
import {TranslationService} from "../../i18n/translation.service";
import {TranslatePipe} from "../../i18n/translate.pipe";

@Component({
    selector: 'app-administrators',
    imports: [ButtonDirective, IconField, InputIcon, InputText, TableModule, Button, DatePipe, TranslatePipe],
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
                private confirmationService: ConfirmationService,
                private translationService: TranslationService) {
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
            header: this.translationService.t('administrators.addNew'),
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
            header: this.translationService.t('administrators.detailsFor') + ' ' + administrator.fullName,
            data: {
                contentType: EntityType.Administrator,
                data: administrator
            }
        });
    }

    openUpdateDialog(administrator: Administrator) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t('administrators.updateDataFor') + ' ' + administrator.fullName,
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
            message: this.translationService.t('administrators.confirmDeactivate'),
            header: this.translationService.t('common.confirmDeletionHeader') + ' ' + administrator.fullName,
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: this.translationService.t('common.no'),
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: this.translationService.t('common.yes'),
            },
            accept: () => {
                this.administratorService.deleteAdministrator(administrator.id)
                    .subscribe((response) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translationService.t('common.success'),
                            detail: this.translationService.t('administrators.deactivatedDetail')
                        });
                        this.loadData();
                    }, error => {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translationService.t('common.error'),
                            detail: this.translationService.t('administrators.deactivateErrorDetail')
                        });
                    });
            }
        });
    }

    private loadData() {
        this.administratorService.getAllAdministrators().subscribe((response: Administrator[]) => {
            this.administrators = response
                .filter((x: Administrator) => !x.isDeleted)
                .map((x: Administrator) => Object.assign(new Administrator(), x));
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
