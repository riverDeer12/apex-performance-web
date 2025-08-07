import {Routes} from "@angular/router";
import {LoginComponent} from "./components/login/login.component";
import {RegistrationComponent} from "./registration/registration.component";
import {ResetPasswordComponent} from "./components/reset-password/reset-password.component";
import { MailConfirmationComponent } from "./components/mail-confirmation/mail-confirmation.component";

export const AuthenticationRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'mail-confirmation/:token',
        component: MailConfirmationComponent
    },
    {
        path: 'registration',
        component: RegistrationComponent
    },
    {
        path: 'reset-password/:token',
        component: ResetPasswordComponent
    }
]
