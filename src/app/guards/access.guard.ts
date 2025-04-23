import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from "../features/authentication/services/authentication.service";
import {Roles} from "../constants/roles";

/**
 * Auth guard for admin routes.
 */
@Injectable({
    providedIn: 'root'
})
export class AccessGuard implements CanActivate {
    requiredPermissions!: string[];

    constructor(private authenticationService: AuthenticationService,
                private router: Router) {
    }

    /**
     * Method that controls
     * user's authorization state.
     * @param route route that needs to be checked.
     * @param _state
     */
    canActivate(
        route: ActivatedRouteSnapshot,
        _state: RouterStateSnapshot
    ): boolean | Promise<boolean> {

        this.requiredPermissions = route.data['permissions'] as string[];

        if (!this.authenticationService.isUserLogged()) {
            this.router.navigateByUrl('/authentication/login').then();
            return false;
        } else {
            return this.validateAccess();
        }
    }

    /**
     * Check if user
     * has valid required
     * policies.
     *
     * @returns true if user has valid required policies.
     */
    validateAccess(): boolean {
        const userPermissions = this.authenticationService.getLoggedUserPermissions();
        return this.requiredPermissions.every(policy => userPermissions.includes(policy));
    }
}
