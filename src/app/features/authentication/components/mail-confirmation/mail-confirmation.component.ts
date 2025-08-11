import {Component} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Button, ButtonDirective} from "primeng/button";
import {ReactiveFormsModule} from "@angular/forms";
import {AppConfigurator} from "../../../../layout/component/app.configurator";

@Component({
    selector: 'app-mail-confirmation',
    imports: [
        Button,
        ReactiveFormsModule,
        ButtonDirective,
        AppConfigurator
    ],
    templateUrl: './mail-confirmation.component.html',
    styleUrl: './mail-confirmation.component.scss'
})
export class MailConfirmationComponent {


    constructor(private authenticationService: AuthenticationService,
                private router: Router,
                private route: ActivatedRoute) {
        this.route.paramMap.subscribe(params => {
            const token = params.get('token') as string;

            if (!token) {
                this.router.navigateByUrl("/forbidden").then();
                return;
            }

            const validToken = this.authenticationService.validateToken(token);

            if (validToken) {
                localStorage.setItem('token', token);
            } else {
                this.router.navigateByUrl("/authentication/login").then();
            }
        });
    }

    login(): void {
        this.router.navigateByUrl("admin/dashboard").then();
    }
}
