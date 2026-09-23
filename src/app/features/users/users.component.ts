import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Button, ButtonDirective} from "primeng/button";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {Table, TableModule} from "primeng/table";
import {User} from "./models/user";
import {UserService} from "./services/user.service";
import {DatePipe} from "@angular/common";
import {DialogFormComponent} from "../../shared/components/dialog-form/dialog-form.component";
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {DialogInfoComponent} from "../../shared/components/dialog-info/dialog-info.component";
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {HelperService} from "../../shared/services/helper.service";
import {TranslationService} from "../../i18n/translation.service";
import {TranslatePipe} from "../../i18n/translate.pipe";

@Component({
    selector: 'app-users',
    imports: [
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        TableModule,
        Button,
        DatePipe,
        TranslatePipe
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
            header: this.translationService.t('users.addNew'),
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
            header: this.translationService.t('users.detailsFor') + ' ' + user.username,
            data: {
                contentType: EntityType.User,
                data: user
            }
        });
    }

    openUpdateDialog(user: User) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t('users.updateDataFor') + ' ' + user.username,
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
            message: this.translationService.t('users.confirmDeactivate'),
            header: this.translationService.t('common.confirmDeletionHeader') + ' ' + user.username,
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
                this.userService.deleteUser(user.id)
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translationService.t('common.success'),
                            detail: this.translationService.t('users.deactivatedDetail')
                        });
                        this.loadData();
                    }, () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translationService.t('common.error'),
                            detail: this.translationService.t('users.deactivateErrorDetail')
                        });
                    });
            }
        });
    }

    private loadData() {
        this.userService.getAllUsers().subscribe((response: User[]) => {
            this.users = response
                .filter((x: User) => !x.isDeleted)
                .map((x: User) => Object.assign(new User(), x));
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
