import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Button, ButtonDirective} from "primeng/button";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {Table, TableModule} from "primeng/table";
import {User} from "./models/user";
import {UserService} from "./services/user.service";
import {DatePipe} from "@angular/common";
import {DialogFormComponent} from "../../components/dialog-form/dialog-form.component";
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogInfoComponent} from "../../components/dialog-info/dialog-info.component";
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {HelperService} from "../../services/helper.service";

@Component({
    selector: 'app-users',
    imports: [
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        TableModule,
        Button,
        DatePipe
    ],
    standalone: true,
    providers: [
        DialogService
    ],
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss'
})
export class UsersComponent {
    @Input() users!: User[];

    @ViewChild(`filter`) filter!: ElementRef;

    constructor(private userService: UserService,
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
            header: 'Add New User',
            data: {
                contentType: EntityType.User,
                formType: ActionType.Create,
                dialogId: 'createUserForm'
            }
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        })
    }

    openInfoDialog(user: User) {
        this.dialogService.open(DialogInfoComponent, {
            header: 'Details for: ' + user.id,
            data: {
                contentType: EntityType.User,
                data: user
            }
        });
    }

    openUpdateDialog(user: User) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: 'Update data for: ' + user.id,
            data: {
                contentType: EntityType.User,
                formType: ActionType.Update,
                dialogId: 'updateUserForm',
                data: user
            }
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        })
    }

    confirmDelete(user: User) {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to deactivate this user?',
            header: 'Confirm deletion of ' + user.id,
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
                this.userService.deleteUser(user.id)
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'User has been deactivated.'
                        });
                    }, () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error deactivating user.'
                        });
                    });
            }
        });
    }

    private loadData() {
        this.userService.getAllUsers().subscribe((response: User[]) => {
            this.users = response.map((x: User) =>
                Object.assign(new User(), x)
            );
        })
    }

    private getDataStatus() {
        this.helperService.getDataStatus().subscribe((response: boolean) => {
            if(response){
                this.loadData()
            }
        })
    }
}
