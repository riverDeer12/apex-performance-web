import {Component, Input} from '@angular/core';
import {ActionType} from "../../../enums/action-type";
import {RedirectType} from "../../../enums/redirect-type";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../users/services/user.service";
import {AuthenticationService} from "../services/authentication.service";
import {MessageService} from "primeng/api";
import {AuthResponse} from "../models/auth-response";
import {HelperService} from "../../../services/helper.service";

@Component({
    selector: 'app-email-form',
    imports: [],
    standalone: true,
    templateUrl: './email-form.component.html',
    styleUrl: './email-form.component.scss'
})
export class EmailFormComponent {
    @Input() type!: ActionType;
    @Input() dialogId!: string;
    @Input() redirectType!: RedirectType;

    form!: FormGroup;

    loadingData = false;

    authResponse!: AuthResponse;

    constructor(private route: ActivatedRoute, private formBuilder: FormBuilder,
                private router: Router,
                private userService: UserService,
                private helperService: HelperService,
                private authenticationService: AuthenticationService,
                private messageService: MessageService) {
        this.initForm();
    }

    ngOnInit(): void {
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

        this.sendEmail();
    }

    private initForm() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required]]
        })
    }

    private sendEmail() {
        this.authenticationService.forgotPassword(this.form.value).subscribe((response) => {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Sent email successfully. You will get password link soon.'
            });

            this.helperService.redirectUserAfterSubmit(this.redirectType, '', this.dialogId);

            this.loadingData = false;
        }, error => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error sending email.',
                detail: error.message
            });
            this.loadingData = false;
        })
    }
}
