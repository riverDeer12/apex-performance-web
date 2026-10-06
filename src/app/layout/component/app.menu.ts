import { Component, OnInit, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MenuItem } from "primeng/api";
import { AppMenuitem } from "./app.menuitem";
import { AuthenticationService } from "../../features/authentication/services/authentication.service";
import { Permissions } from "../../constants/permissions";
import { Roles } from "../../constants/roles";
import { TranslationService } from "../../i18n/translation.service";
import { UserService } from "../../features/users/services/user.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-menu",
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `
    <ul class="layout-menu">
      <ng-container *ngFor="let item of model; let i = index">
        <li
          app-menuitem
          *ngIf="!item.separator"
          [item]="item"
          [index]="i"
          [root]="true"
        ></li>
        <li *ngIf="item.separator" class="menu-separator"></li>
      </ng-container>
    </ul>
  `,
})
export class AppMenu implements OnInit {
  model: MenuItem[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private translationService: TranslationService,
    private userService: UserService,
  ) {
    effect(() => {
      this.translationService.language();
      this.buildMenu();
    });
  }

  ngOnInit() {
    this.buildMenu();
  }

  /**
   * Dashboard runs on the API, the window is opened before the
   * token request so the browser doesn't block it as a popup.
   */
  private openJobsDashboard(): void {
    const dashboardWindow = window.open("", "_blank");

    this.userService.getJobsDashboardToken().subscribe({
      next: (response) => {
        const url = new URL("/jobs", new URL(environment.apiUrl).origin);
        url.searchParams.set("token", response.token);

        if (dashboardWindow) dashboardWindow.location.href = url.toString();
      },
      error: (err) => {
        dashboardWindow?.close();
        console.error(err);
      },
    });
  }

  private buildMenu() {
    const t = (key: string) => this.translationService.t(key);

    this.model = [
      {
        label: t("menu.home"),
        items: [
          {
            label: t("menu.dashboard"),
            icon: "pi pi-fw pi-home",
            routerLink: ["/admin/dashboard"],
          },
        ],
      },
      {
        label: t("menu.administrators"),
        visible: this.authenticationService.validateUserRole(),
        items: [
          {
            label: t("menu.administrators"),
            icon: "pi pi-fw pi-users",
            routerLink: ["/admin/administrators"],
          },
        ],
      },
      {
        label: t("menu.appointments"),
        // Clients see their appointments on the dashboard.
        visible: this.authenticationService.getUserRole() !== Roles.Client,
        items: [
          {
            label: t("menu.appointmentsHistory"),
            icon: "pi pi-fw pi-calendar",
            visible: this.authenticationService.checkPermission(
              Permissions.CanGetAppointments,
            ),
            routerLink: ["/admin/appointments"],
          },
          {
            label: t("menu.appointmentTypes"),
            visible: this.authenticationService.validateUserRole(),
            icon: "pi pi-fw pi-bookmark",
            routerLink: ["/admin/appointments/appointment-types"],
          },
          {
            label: t("menu.appointmentLocations"),
            visible: this.authenticationService.validateUserRole(),
            icon: "pi pi-fw pi-map-marker",
            routerLink: ["/admin/appointments/appointment-locations"],
          },
          {
            label: t("menu.recurringAppointments"),
            visible: this.authenticationService.checkPermission(
              Permissions.CanGetRecurringAppointments,
            ),
            icon: "pi pi-fw pi-calendar-clock",
            routerLink: ["/admin/appointments/recurring-appointments"],
          },
        ],
      },
      {
        // Every role sees requests, the API returns
        // only requests the logged user can see.
        label: t("menu.requests"),
        items: [
          {
            label: t("menu.appointmentRequests"),
            icon: "pi pi-fw pi-file-check",
            routerLink: ["/admin/appointments/appointment-requests"],
          },
          {
            label: t("menu.cancelationRequests"),
            icon: "pi pi-fw pi-calendar-times",
            routerLink: ["/admin/appointments/cancelation-requests"],
          },
          {
            label: t("menu.joinRequests"),
            icon: "pi pi-fw pi-user-plus",
            routerLink: ["/admin/appointments/join-requests"],
          },
        ],
      },
      {
        // Coaches and administrators manage trainings,
        // clients see their own trainings.
        label: t("menu.trainings"),
        items: [
          {
            label: t("menu.trainings"),
            icon: "pi pi-fw pi-list-check",
            routerLink: ["/admin/trainings"],
          },
          {
            label: t("menu.trainingProgress"),
            icon: "pi pi-fw pi-chart-line",
            routerLink: ["/admin/trainings/progress"],
          },
        ],
      },
      {
        label: t("menu.bodyMeasurements"),
        // Clients always see their own measurements,
        // the API returns only measurements of the logged client.
        visible:
          this.authenticationService.checkPermission(
            Permissions.CanGetBodyMeasurements,
          ) || this.authenticationService.validateUserRole(Roles.Client),
        items: [
          {
            label: t("menu.bodyMeasurements"),
            icon: "pi pi-fw pi-gauge",
            routerLink: ["/admin/body-measurements"],
          },
        ],
      },
      {
        label: t("menu.clients"),
        visible: this.authenticationService.validateUserRole(Roles.Coach),
        items: [
          {
            label: t("menu.clients"),
            icon: "pi pi-fw pi-book",
            routerLink: ["/admin/clients"],
          },
          {
            label: t("menu.fms"),
            icon: "pi pi-fw pi-gauge",
            routerLink: ["/admin/clients/functional-movement-screens"],
          },
        ],
      },
      {
        label: t("menu.coaches"),
        visible: this.authenticationService.validateUserRole(),
        items: [
          {
            label: t("menu.coaches"),
            icon: "pi pi-fw pi-users",
            routerLink: ["/admin/coaches"],
          },
        ],
      },
      {
        label: t("menu.timeSlots"),
        visible: this.authenticationService.validateUserRole(Roles.Coach),
        items: [
          {
            label: t("menu.timeSlots"),
            icon: "pi pi-fw pi-clock",
            routerLink: ["/admin/time-slots"],
          },
        ],
      },
      {
        label: t("menu.users"),
        // Coaches see only sessions of their clients,
        // other user management is for super admin.
        visible:
          this.authenticationService.validateUserRole() ||
          this.authenticationService.validateUserRole(Roles.Coach),
        items: [
          {
            label: t("menu.userSessions"),
            icon: "pi pi-fw pi-sign-in",
            routerLink: ["/admin/users/sessions"],
          },
          {
            label: t("menu.deviceTokens"),
            visible: this.authenticationService.validateUserRole(),
            icon: "pi pi-fw pi-key",
            routerLink: ["/admin/users/device-tokens"],
          },
          {
            label: t("menu.users"),
            visible: this.authenticationService.validateUserRole(),
            icon: "pi pi-fw pi-users",
            routerLink: ["/admin/users"],
          },
          {
            label: t("menu.userRoles"),
            visible: this.authenticationService.validateUserRole(),
            icon: "pi pi-fw pi-crown",
            routerLink: ["/admin/users/roles"],
          },
          {
            label: t("menu.backgroundJobs"),
            visible: this.authenticationService.validateUserRole(),
            icon: "pi pi-fw pi-cog",
            command: () => this.openJobsDashboard(),
          },
          {
            label: t("menu.logs"),
            visible: this.authenticationService.validateUserRole(),
            icon: "pi pi-fw pi-file",
            routerLink: ["/admin/users/logs"],
          },
        ],
      },
      {
        // Clients can view workouts, only
        // administrators and coaches can manage them.
        label: t("menu.workouts"),
        items: [
          {
            label: t("menu.workouts"),
            icon: "pi pi-fw pi-bolt",
            routerLink: ["/admin/workouts"],
          },
        ],
      },
    ];
  }
}
