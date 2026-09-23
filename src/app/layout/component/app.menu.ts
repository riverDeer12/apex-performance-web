import { Component, OnInit, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MenuItem } from "primeng/api";
import { AppMenuitem } from "./app.menuitem";
import { AuthenticationService } from "../../features/authentication/services/authentication.service";
import { Permissions } from "../../constants/permissions";
import { Roles } from "../../constants/roles";
import { TranslationService } from "../../i18n/translation.service";

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
  ) {
    effect(() => {
      this.translationService.language();
      this.buildMenu();
    });
  }

  ngOnInit() {
    this.buildMenu();
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
            label: t("menu.appointmentRequests"),
            visible: this.authenticationService.checkPermission(
              Permissions.CanGetAppointmentRequests,
            ),
            icon: "pi pi-fw pi-file-check",
            routerLink: ["/admin/appointments/appointment-requests"],
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
        label: t("menu.bodyMeasurements"),
        visible: this.authenticationService.checkPermission(
          Permissions.CanGetBodyMeasurements,
        ),
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
        visible: this.authenticationService.validateUserRole(),
        items: [
          {
            label: t("menu.deviceTokens"),
            icon: "pi pi-fw pi-key",
            routerLink: ["/admin/users/device-tokens"],
          },
          {
            label: t("menu.users"),
            icon: "pi pi-fw pi-users",
            routerLink: ["/admin/users"],
          },
          {
            label: t("menu.userRoles"),
            icon: "pi pi-fw pi-crown",
            routerLink: ["/admin/users/roles"],
          },
          {
            label: t("menu.logs"),
            icon: "pi pi-fw pi-file",
            routerLink: ["/admin/users/logs"],
          },
        ],
      },
    ];
  }
}
