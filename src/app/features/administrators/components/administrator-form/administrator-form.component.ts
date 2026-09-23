import {Component, Input, OnInit} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActionType} from "../../../../enums/action-type";
import {ValidationService} from "../../../../shared/services/validation.service";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {Administrator} from "../../models/administrator";
import {AdministratorService} from "../../services/administrator.service";
import {RedirectType} from "../../../../enums/redirect-type";
import {HelperService} from "../../../../shared/services/helper.service";
import {getErrorMessage} from "../../../../constants/error-codes";
import {Select} from "primeng/select";
import {User} from "../../../users/models/user";
import {UserService} from "../../../users/services/user.service";
import {TranslationService} from "../../../../i18n/translation.service";
import {TranslatePipe} from "../../../../i18n/translate.pipe";

@Component({
    selector: 'app-administrator-form',
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        ReactiveFormsModule,
        Select,
        TranslatePipe
    ],
    standalone: true,
    templateUrl: './administrator-form.component.html',
    styleUrl: './administrator-form.component.scss'
})
export class AdministratorFormComponent implements OnInit {
    @Input() type!: ActionType;
    @Input() administrator!: Administrator;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    users!: User[];

    loadingData!: boolean;

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private router: Router,
        private helperService: HelperService,
        private userService: UserService,
        private administratorService: AdministratorService,
        private messageService: MessageService,
        private translationService: TranslationService) {
    }

    ngOnInit(): void {
        this.initForm();
        this.getUsers();
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
            this.createAdministrator() : this.updateAdministrator();
    }

    private initForm = () => this.type == ActionType.Create ?
        this.initCreateForm() : this.initUpdateForm();

    private initCreateForm() {
        this.form = this.formBuilder.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            user: ['', [Validators.required]]
        })
    }

    private initUpdateForm() {
        this.form = this.formBuilder.group({
            firstName: [this.administrator.firstName, [Validators.required]],
            lastName: [this.administrator.lastName, [Validators.required]],
            user: [this.administrator.user.id, [Validators.required]]
        })
    }

    private createAdministrator() {
        this.administratorService.createAdministrator(this.form.value).subscribe({
            next: (response: Administrator) => {
                this.administrator = Object.assign(new Administrator(), response)

                this.messageService.add({
                    severity: 'success',
                    summary: this.translationService.t('common.success'),
                    detail: this.translationService.t('administrators.createdDetail')
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                console.error('Error:', error);

                this.messageService.add({
                    severity: 'error',
                    summary: this.translationService.t('administrators.createErrorSummary'),
                    detail: getErrorMessage(error)
                });
            },
            complete: () => {
                this.loadingData = false;
            }
        });
    }

    private updateAdministrator() {
        this.administratorService.updateAdministrator(this.administrator.id, this.form.value).subscribe({
            next: (response: Administrator) => {
                this.administrator = Object.assign(new Administrator(), response)

                this.messageService.add({
                    severity: 'success',
                    summary: this.translationService.t('common.success'),
                    detail: this.translationService.t('administrators.updatedDetail')
                });

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                console.error('Error:', error);

                this.messageService.add({
                    severity: 'error',
                    summary: this.translationService.t('administrators.updateErrorSummary'),
                    detail: getErrorMessage(error)
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
}
