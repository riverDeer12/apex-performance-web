import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Button, ButtonDirective} from "primeng/button";
import {DatePipe} from "@angular/common";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {Table, TableModule} from "primeng/table";
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {DialogFormComponent} from "../../../components/dialog-form/dialog-form.component";
import {EntityType} from "../../../enums/entity-type";
import {ActionType} from "../../../enums/action-type";
import {DialogInfoComponent} from "../../../components/dialog-info/dialog-info.component";
import {Role} from "./models/role";
import {RoleService} from "./services/role.service";
import {HelperService} from "../../../services/helper.service";

@Component({
    selector: 'app-roles',
    imports: [
        Button,
        ButtonDirective,
        DatePipe,
        IconField,
        InputIcon,
        InputText,
        TableModule
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
                private messageService: MessageService) {
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
            header: 'Add New Role',
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
            header: 'Details for: ' + role.id,
            data: {
                contentType: EntityType.Role,
                data: role
            }
        });
    }

    openUpdateDialog(role: Role) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: 'Update data for: ' + role.id,
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
            message: 'Are you sure that you want to deactivate this role?',
            header: 'Confirm deletion of ' + role.id,
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
                this.roleService.deleteRole(role.id)
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Role has been deactivated.'
                        });
                    }, () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error deactivating role.'
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
            this.roles = response.map((x: Role) =>
                Object.assign(new Role(), x)
            );
        })
    }
}
