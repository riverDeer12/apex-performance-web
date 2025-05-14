import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import {Injectable} from "@angular/core";
import {AuthenticationService} from "../features/authentication/services/authentication.service";
import {Roles} from "../constants/roles";

/**
 * Auth guard for admin routes.
 */
@Injectable({
    providedIn: "root",
})
export class AdminGuard implements CanActivate {
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
    ) {
    }

    /**
     * Method that controls
     * user's authorization state.
     * @param route route that needs to be checked.
     * @param _state
     */
    canActivate(
        route: ActivatedRouteSnapshot,
        _state: RouterStateSnapshot,
    ): boolean | Promise<boolean> {
        if (!this.authenticationService.isUserLogged()) {
            this.router.navigateByUrl("/authentication/login").then();
            return false;
        } else {
            return true;
        }
    }
}
