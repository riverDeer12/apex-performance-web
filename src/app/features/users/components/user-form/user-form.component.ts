import {Component, Input} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActionType} from "../../../../enums/action-type";
import {ValidationService} from "../../../../shared/services/validation.service";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {User} from "../../models/user";
import {UserService} from "../../services/user.service";
import {RedirectType} from "../../../../enums/redirect-type";
import {HelperService} from "../../../../shared/services/helper.service";
import {getErrorMessage} from "../../../../constants/error-codes";
import {MultiSelect} from "primeng/multiselect";
import {Role} from "../../../roles/roles/models/role";
import {RoleService} from "../../../roles/roles/services/role.service";
import {Password} from "primeng/password";
import {TranslationService} from "../../../../i18n/translation.service";
import {TranslatePipe} from "../../../../i18n/translate.pipe";

@Component({
    selector: 'app-user-form',
    imports: [
        ButtonModule,
        InputTextModule,
        CommonModule,
        ReactiveFormsModule,
        MultiSelect,
        Password,
        TranslatePipe
    ],
    standalone: true,
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.scss'
})
export class UserFormComponent {
    @Input() type!: ActionType;
    @Input() user!: User;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    roles!: Role[];

    loadingData!: boolean;

    public get formType(): typeof ActionType {
        return ActionType;
    }

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private router: Router,
        private helperService: HelperService,
        private roleService: RoleService,
        private userService: UserService,
        private messageService: MessageService,
        private translationService: TranslationService) {
    }

    ngOnInit(): void {
        this.initForm();
        this.getRoles()
    }

    submit() {
        this.loadingData = true;

        if (this.form.invalid) {

            this.form.markAllAsTouched();

            this.messageService
                .add({
                    severity: 'warn',
                    summary: this.translationService.t('common.incompleteTitle'),
                    detail: this.translationService.t('common.incompleteDetail')
                });

            this.loadingData = false;

            return;

        }

        this.type == ActionType.Create ?
            this.createUser() : this.updateUser();
    }

    private initForm = () => this.type == ActionType.Create ?
        this.initCreateForm() : this.initUpdateForm();

    private initCreateForm() {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required],
            confirmPassword: ['', [Validators.required, this.passwordMatchValidator]],
            email: ['', [Validators.required]],
            roles: ['', Validators.required]
        })
    }

    private initUpdateForm() {
        this.form = this.formBuilder.group({
            username: [this.user.username, [Validators.required]],
            email: [this.user.email, [Validators.required]],
            roles: [this.user.roles?.map(x => x.id), [Validators.required]]
        })
    }

    private createUser() {
        this.userService.createUser(this.form.value).subscribe({
            next: (response: User) => {
                this.user = Object.assign(new User(), response)

                this.messageService.add({
                    severity: 'success',
                    summary: this.translationService.t('common.success'),
                    detail: this.translationService.t('users.createdDetail')
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translationService.t('users.createErrorSummary'),
                    detail: getErrorMessage(error)
                });
            },
            complete: () => {
                this.loadingData = false;
            }
        });
    }

    private updateUser() {
        this.userService.updateUser(this.user.id, this.form.value).subscribe({
            next: (response: User) => {
                this.user = Object.assign(new User(), response)

                this.messageService.add({
                    severity: 'success',
                    summary: this.translationService.t('common.success'),
                    detail: this.translationService.t('users.updatedDetail')
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {

                this.messageService.add({
                    severity: 'error',
                    summary: this.translationService.t('users.updateErrorSummary'),
                    detail: getErrorMessage(error)
                });
            },
            complete: () => {
                this.loadingData = false;
            }
        });
    }


    private getRoles() {
        this.roleService.getAllRoles().subscribe((response: Role[]) => {
            this.roles = response.map((x: Role) =>
                Object.assign(new Role(), x)
            );
        })
    }

    private passwordMatchValidator(form: FormGroup) {
        const password = form.get('password')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return password === confirmPassword ? null : {mismatch: true};
    }
}
