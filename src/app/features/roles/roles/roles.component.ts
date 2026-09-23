import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Button, ButtonDirective} from "primeng/button";
import {DatePipe} from "@angular/common";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {Table, TableModule} from "primeng/table";
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {DialogFormComponent} from "../../../shared/components/dialog-form/dialog-form.component";
import {EntityType} from "../../../enums/entity-type";
import {ActionType} from "../../../enums/action-type";
import {DialogInfoComponent} from "../../../shared/components/dialog-info/dialog-info.component";
import {Role} from "./models/role";
import {RoleService} from "./services/role.service";
import {HelperService} from "../../../shared/services/helper.service";
import {TranslationService} from "../../../i18n/translation.service";
import {TranslatePipe} from "../../../i18n/translate.pipe";

@Component({
    selector: 'app-roles',
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
    standalone: true,
    providers: [
        DialogService
    ],
    templateUrl: './roles.component.html',
    styleUrl: './roles.component.scss'
})
export class RolesComponent {
    @Input() roles!: Role[];

    @ViewChild(`filter`) filter!: ElementRef;

    constructor(private roleService: RoleService,
                private dialogService: DialogService,
                private helperService: HelperService,
                private confirmationService: ConfirmationService,
                private messageService: MessageService,
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
            header: this.translationService.t('roles.addNew'),
            data: {
                contentType: EntityType.Role,
                formType: ActionType.Create,
                dialogId: 'createRoleForm'
            }
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        })
    }

    openInfoDialog(role: Role) {
        this.dialogService.open(DialogInfoComponent, {
            header: this.translationService.t('roles.detailsFor') + ' ' + role.name,
            data: {
                contentType: EntityType.Role,
                data: role
            }
        });
    }

    openUpdateDialog(role: Role) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t('roles.updateDataFor') + ' ' + role.name,
            data: {
                contentType: EntityType.Role,
                formType: ActionType.Update,
                dialogId: 'updateRoleForm',
                data: role
            }
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        })
    }

    confirmDelete(role: Role) {
        this.confirmationService.confirm({
            message: this.translationService.t('roles.confirmDeactivate'),
            header: this.translationService.t('common.confirmDeletionHeader') + ' ' + role.name,
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
                this.roleService.deleteRole(role.id)
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translationService.t('common.success'),
                            detail: this.translationService.t('roles.deactivatedDetail')
                        });

                        this.loadData();
                    }, () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translationService.t('common.error'),
                            detail: this.translationService.t('roles.deactivateErrorDetail')
                        });
                    });
            }
        });
    }

    private getDataStatus() {
        this.helperService.getDataStatus().subscribe((response: boolean) => {
            if (response) {
                this.loadData()
            }
        })
    }

    private loadData() {
        this.roleService.getAllRoles().subscribe((response: Role[]) => {
            this.roles = response
                .filter((x: Role) => !x.isDeleted)
                .map((x: Role) => Object.assign(new Role(), x));
        })
    }
}
