import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputText } from 'primeng/inputtext';
import { InputIcon } from 'primeng/inputicon';
import { Roles } from '../../../../../constants/roles';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HelperService } from '../../../../../shared/services/helper.service';
import { AuthenticationService } from '../../../../authentication/services/authentication.service';
import { DialogFormComponent } from '../../../../../shared/components/dialog-form/dialog-form.component';
import { EntityType } from '../../../../../enums/entity-type';
import { ActionType } from '../../../../../enums/action-type';
import { DialogInfoComponent } from '../../../../../shared/components/dialog-info/dialog-info.component';
import { FunctionalMovementScreenService } from '../../services/functional-movement-screen.service';
import { FunctionalMovementScreen } from '../../models/functional-movement-screen';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
    selector: 'app-functional-movement-screens',
    imports: [
        CommonModule,
        DatePipe,
        Button,
        TableModule,
        IconField,
        InputText,
        InputIcon,
        ButtonDirective
    ],
    providers: [DialogService],
    templateUrl: './functional-movement-screens.component.html',
    styleUrl: './functional-movement-screens.component.scss'
})
export class FunctionalMovementScreensComponent {
    @Input() functionalMovementScreens!: FunctionalMovementScreen[];

    @ViewChild(`filter`) filter!: ElementRef;

    userRole!: string;

    get userRoles(): typeof Roles {
        return Roles;
    }

    get canManageFunctionalMovementScreens(): boolean {
        const loggedUserRole = this.authenticationService.getUserRole();

        return (
            loggedUserRole == Roles.Administrator || loggedUserRole == Roles.Coach
        );
    }

    constructor(
        private functionalMovementScreenService: FunctionalMovementScreenService,
        private dialogService: DialogService,
        private messageService: MessageService,
        private helperService: HelperService,
        private confirmationService: ConfirmationService,
        private authenticationService: AuthenticationService
    ) {
        this.userRole = this.authenticationService.getUserRole();
    }

    ngOnInit(): void {
        this.loadData();
        this.getDataStatus();
    }

    private loadData(): void {
        this.functionalMovementScreenService
            .getFunctionalMovementScreens()
            .subscribe((response: FunctionalMovementScreen[]) => {
                this.functionalMovementScreens = response.map(
                    (x: FunctionalMovementScreen) =>
                        Object.assign(new FunctionalMovementScreen(), x)
                );
            });
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
            header: 'Add New Functional Movement Screen',
            data: {
                contentType: EntityType.FunctionalMovementScreen,
                formType: ActionType.Create,
                dialogId: 'createFunctionalMovementScreenForm'
            }
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        });
    }

    openInfoDialog(functionalMovementScreen: FunctionalMovementScreen) {
        this.dialogService.open(DialogInfoComponent, {
            header: 'Details for: ' + functionalMovementScreen.id,
            data: {
                contentType: EntityType.FunctionalMovementScreen,
                data: functionalMovementScreen
            }
        });
    }

    openUpdateDialog(functionalMovementScreen: FunctionalMovementScreen) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: 'Update data for: ' + functionalMovementScreen.id,
            data: {
                contentType: EntityType.FunctionalMovementScreen,
                formType: ActionType.Update,
                dialogId: 'updateFunctionalMovementScreenForm',
                data: functionalMovementScreen
            }
        });

        dialogRef.onClose.subscribe((response: any) => {
            this.loadData();
        });
    }

    confirmDelete(functionalMovementScreen: FunctionalMovementScreen) {
        this.confirmationService.confirm({
            message:
                'Are you sure that you want to deactivate this Functional Movement Screen?',
            header: 'Confirm deletion of ' + functionalMovementScreen.id,
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Yes'
            },
            accept: () => {
                this.functionalMovementScreenService
                    .deleteFunctionalMovementScreen(functionalMovementScreen.id)
                    .subscribe(
                        (response) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Functional Movement Screen has been deactivated.'
                            });

                            this.loadData();
                        },
                        (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error deactivating Functional Movement Screen.'
                            });
                        }
                    );
            }
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
