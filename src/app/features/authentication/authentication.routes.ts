import {Routes} from "@angular/router";
import {LoginComponent} from "./components/login/login.component";
import {RegistrationComponent} from "./registration/registration.component";
import {ResetPasswordComponent} from "./components/reset-password/reset-password.component";

export const AuthenticationRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
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
