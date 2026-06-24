import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MenuItem } from "primeng/api";
import { AppMenuitem } from "./app.menuitem";
import { AuthenticationService } from "../../features/authentication/services/authentication.service";
import { Permissions } from "../../constants/permissions";
import { Roles } from "../../constants/roles";

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

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.model = [
      {
        label: "Home",
        items: [
          {
            label: "Dashboard",
            icon: "pi pi-fw pi-home",
            routerLink: ["/admin/dashboard"],
          },
        ],
      },
      {
        label: "Administrators",
        visible: this.authenticationService.validateUserRole(),
        items: [
          {
            label: "Administrators",
            icon: "pi pi-fw pi-users",
            routerLink: ["/admin/administrators"],
          },
        ],
      },
      {
        label: "Appointments",
        items: [
          {
            label: "Appointments' History",
            icon: "pi pi-fw pi-calendar",
            visible: this.authenticationService.checkPermission(
              Permissions.CanGetAppointments,
            ),
            routerLink: ["/admin/appointments"],
          },
          {
            label: "Appointment Types",
            visible: this.authenticationService.validateUserRole(),
            icon: "pi pi-fw pi-bookmark",
            routerLink: ["/admin/appointments/appointment-types"],
          },
          {
            label: "Appointment Requests",
            visible: this.authenticationService.checkPermission(
              Permissions.CanGetAppointmentRequests,
            ),
            icon: "pi pi-fw pi-file-check",
            routerLink: ["/admin/appointments/appointment-requests"],
          },
          {
            label: "Recurring Appointments",
            visible: this.authenticationService.checkPermission(
              Permissions.CanGetRecurringAppointments,
            ),
            icon: "pi pi-fw pi-calendar-clock",
            routerLink: ["/admin/appointments/recurring-appointments"],
          },
        ],
      },
      {
        label: "Body Measurements",
        visible: this.authenticationService.checkPermission(
          Permissions.CanGetBodyMeasurements,
        ),
        items: [
          {
            label: "Body Measurements",
            icon: "pi pi-fw pi-gauge",
            routerLink: ["/admin/body-measurements"],
          },
        ],
      },
      {
        label: "Clients",
        visible: this.authenticationService.validateUserRole(Roles.Coach),
        items: [
          {
            label: "Clients",
            icon: "pi pi-fw pi-book",
            routerLink: ["/admin/clients"],
          },
          {
            label: "FMS",
            icon: "pi pi-fw pi-gauge",
            routerLink: ["/admin/clients/functional-movement-screens"],
          },
        ],
      },
      {
        label: "Coaches",
        visible: this.authenticationService.validateUserRole(),
        items: [
          {
            label: "Coaches",
            icon: "pi pi-fw pi-users",
            routerLink: ["/admin/coaches"],
          },
        ],
      },
      {
        label: "Time Slots",
        visible: this.authenticationService.validateUserRole(Roles.Coach),
        items: [
          {
            label: "Time Slots",
            icon: "pi pi-fw pi-clock",
            routerLink: ["/admin/time-slots"],
          },
        ],
      },
      {
        label: "Users",
        visible: this.authenticationService.validateUserRole(),
        items: [
          {
            label: "Device Tokens",
            icon: "pi pi-fw pi-key",
            routerLink: ["/admin/users/device-tokens"],
          },
          {
            label: "Users",
            icon: "pi pi-fw pi-users",
            routerLink: ["/admin/users"],
          },
          {
            label: "User Roles",
            icon: "pi pi-fw pi-crown",
            routerLink: ["/admin/users/roles"],
          },
          {
            label: "Logs",
            icon: "pi pi-fw pi-file",
            routerLink: ["/admin/users/logs"],
          },
        ],
      },
    ];
  }
}
