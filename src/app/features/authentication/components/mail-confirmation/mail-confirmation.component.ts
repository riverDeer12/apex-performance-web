import {Component} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-mail-confirmation',
    imports: [],
    templateUrl: './mail-confirmation.component.html',
    styleUrl: './mail-confirmation.component.scss'
})
export class MailConfirmationComponent {


    constructor(private authenticationService: AuthenticationService,
                private router: Router,
                private messageService: MessageService,
                private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const token = params.get('token') as string;

            if (!token) {
                this.router.navigateByUrl("/forbidden").then();
                return;
            }

            const validToken = this.authenticationService.validateToken(token);

            if (validToken) {

                localStorage.setItem('token', token);

                this.authenticationService.notifyMailConfirmation().subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Login and Mail Confirmation is Successful.'
                        });

                        this.router.navigateByUrl("/admin/dashboard").then();
                    }
                })
            } else {
                this.router.navigateByUrl("/authentication/login").then();
            }
        });
    }
}
