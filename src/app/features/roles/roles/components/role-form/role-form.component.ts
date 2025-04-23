import {Component, Input} from '@angular/core';
import {ActionType} from "../../../../../enums/action-type";
import {RedirectType} from "../../../../../enums/redirect-type";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ValidationService} from "../../../../../services/validation.service";
import {Router} from "@angular/router";
import {HelperService} from "../../../../../services/helper.service";
import {MessageService} from "primeng/api";
import {Role} from "../../models/role";
import {RoleService} from "../../services/role.service";
import {Button} from "primeng/button";
import {InputText} from "primeng/inputtext";
import {MultiSelect} from "primeng/multiselect";
import {Permission} from "../../models/permission";
import {CommonModule} from "@angular/common";
import {User} from "../../../../users/models/user";
import {UserService} from "../../../../users/services/user.service";

@Component({
    selector: 'app-role-form',
    imports: [
        CommonModule,
        Button,
        FormsModule,
        InputText,
        ReactiveFormsModule,
        MultiSelect
    ],
    standalone: true,
    templateUrl: './role-form.component.html',
    styleUrl: './role-form.component.scss'
})
export class RoleFormComponent {
    @Input() type!: ActionType;
    @Input() role!: Role;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    loadingData = false;

    permissions!: Permission[];

    users!: User[];

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private router: Router,
        private helperService: HelperService,
        private roleService: RoleService,
        private userService: UserService,
        private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.initForm();
        this.getUsers();
        this.getPermissions();
    }

    submit() {
        this.loadingData = true;

        if (this.form.invalid) {

            this.form.markAllAsTouched();

            this.messageService
                .add({
                    severity: 'warn',
                    summary: 'Incomplete or incorrect data',
                    detail: 'Check the entered data and try again.'
                });

            this.loadingData = false;

            return;

        }

        this.type == ActionType.Create ?
            this.createRole() : this.updateRole();
    }

    private initForm = () => this.type == ActionType.Create ?
        this.initCreateForm() : this.initUpdateForm();

    private initCreateForm() {
        this.form = this.formBuilder.group({
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            permissions: ['', [Validators.required]],
            users: ['', [Validators.required]]
        })
    }

    private initUpdateForm() {
        this.form = this.formBuilder.group({
            name: [this.role.name, [Validators.required]],
            description: [this.role.description, [Validators.required]],
            permissions: [this.role.permissions?.map(x => x.id), [Validators.required]],
            users: [this.role.users?.map(x => x.id), [Validators.required]]
        })
    }

    private createRole() {
        this.roleService.createRole(this.form.value).subscribe({
            next: (response: Role) => {
                this.role = Object.assign(new Role(), response)

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Role is created successfully.'
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                console.error('Error:', error);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Creating Role',
                    detail: error.message || 'An unexpected error occurred.'
                });
            },
            complete: () => {
                this.loadingData = false;
            }
        });
    }

    private updateRole() {
        this.roleService.updateRole(this.role.id, this.form.value).subscribe({
            next: (response: Role) => {
                this.role = Object.assign(new Role(), response)

                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Role is updated successfully.'
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Updating Role',
                    detail: error.message || 'An unexpected error occurred.'
                });
            },
            complete: () => {
                this.loadingData = false;
            }
        });
    }

    private getUsers() {
        this.userService.getAllUsers().subscribe((response: User[]) => {
            this.users = response.map((x: User) =>
                Object.assign(new User(), x)
            );
        })
    }

    private getPermissions() {
        this.roleService.getAllPermissions().subscribe((response: Permission[]) => {
            this.permissions = response.map((x: Permission) =>
                Object.assign(new Permission(), x)
            );
        })
    }
}
