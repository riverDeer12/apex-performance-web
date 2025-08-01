import {Component} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {
    FormGroup,
    ReactiveFormsModule,
} from "@angular/forms";
import {MessageService} from "primeng/api";
import {AuthenticationService} from "../../services/authentication.service";
import {AppFloatingConfigurator} from "../../../../layout/component/app.floatingconfigurator";
import {ValidationService} from "../../../../services/validation.service";
import {ResetPasswordFormComponent} from "../reset-password-form/reset-password-form.component";

@Component({
    selector: "app-reset-password",
    standalone: true,
    imports: [
        AppFloatingConfigurator,
        ReactiveFormsModule,
        ResetPasswordFormComponent,
    ],
    providers: [MessageService],
    templateUrl: "./reset-password.component.html",
    styleUrl: "./reset-password.component.scss",
})
export class ResetPasswordComponent {
    form!: FormGroup;

    loadingData = false;

    constructor(
        public validationService: ValidationService,
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService,
    ) {
        this.handleToken();
    }

    private handleToken() {
        let token = this.route.snapshot.paramMap.get("token") || "";

        const isTokenValid = this.authenticationService.validateToken(token);

        if (isTokenValid) {
            localStorage.setItem("token", token);
        }
    }
}
