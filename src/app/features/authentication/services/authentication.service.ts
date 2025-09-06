import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { DefaultPostRequest } from "../../../shared/models/default-post-request";
import { AuthResponse } from "../models/auth-response";
import { Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import { Roles } from "../../../constants/roles";

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login = (request: DefaultPostRequest) =>
    this.http.post<AuthResponse>(
      environment.apiUrl + "/authentication/login",
      request,
    );

  register = (request: DefaultPostRequest) =>
    this.http.post<AuthResponse>(
      environment.apiUrl + "/authentication/register",
      request,
    );

  forgotPassword = (request: DefaultPostRequest) =>
    this.http.post<AuthResponse>(
      environment.apiUrl + "/authentication/forgot-password",
      request,
    );

  notifyMailConfirmation = () =>
    this.http.get(environment.apiUrl + "/authentication/mail-confirmation");

  changeUsername = (request: DefaultPostRequest) =>
    this.http.post<AuthResponse>(
      environment.apiUrl + "/authentication/change-username",
      request,
    );

  isUserLogged(): boolean {
    const token = this.getAuthTokenFromLocalStorage();
    const now = Date.now().valueOf() / 1000;
    return token.exp >= now;
  }

  /**
   * User is valid if it is super admin,
   * or has valid role for resource.
   * @param validRole - value of valid role.
   */
  validateUserRole(validRole?: string): boolean {
    const roles = this.getLoggedUserRoles();

    const userIsSuperAdmin = roles.includes(Roles.SuperAdmin);

    if (userIsSuperAdmin) return true;

    return roles.includes(<string>validRole);
  }

  getUserRole(): string {
    const userRoles = this.getLoggedUserRoles();

    switch (true) {
      case userRoles.includes(Roles.Administrator):
      case userRoles.includes(Roles.SuperAdmin):
        return Roles.Administrator;
      case userRoles.includes(Roles.Client):
        return Roles.Client;
      case userRoles.includes(Roles.Coach):
        return Roles.Coach;
      default:
        return Roles.Client;
    }
  }

  /**
   * Log out user from application.
   *
   * @param redirectUrl preferred redirect url.
   */
  logOut(redirectUrl: string): void {
    localStorage.removeItem("token");
    this.router.navigateByUrl(redirectUrl).then();
  }

  getLoggedUserPermissions(): string[] {
    const token = this.getAuthTokenFromLocalStorage();
    return token.permissions;
  }

  getLoggedUserRoles() {
    const token = this.getAuthTokenFromLocalStorage();

    if (Array.isArray(token.role)) {
      return token.role;
    } else {
      return [token.role];
    }
  }

  getLoggedUserUsername(): string {
    const token = this.getAuthTokenFromLocalStorage();
    return token.name;
  }

  private getAuthTokenFromLocalStorage(): AuthResponse {
    const tokenStorageValue = localStorage.getItem("token");

    if (!tokenStorageValue) {
      return new AuthResponse();
    } else {
      return jwtDecode(tokenStorageValue) as AuthResponse;
    }
  }

  /**
   * Check if user has permission
   * to see some content.
   * @param permission - permission name.
   * @see {@link /src/app/constants/permissions.ts} for a list of permission constants.
   */
  checkPermission(permission: string) {
    const userPermissions = this.getLoggedUserPermissions();
    return userPermissions.includes(permission);
  }

  /**
   * Validate token value from url.
   * @param tokenValue - jwt url token value.
   */
  validateToken(tokenValue: string) {
    const token = jwtDecode(tokenValue) as AuthResponse;

    const now = Date.now().valueOf() / 1000;

    return token.exp >= now;
  }
}
