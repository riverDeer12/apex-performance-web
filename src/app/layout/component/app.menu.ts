import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MenuItem } from "primeng/api";
import { AppMenuitem } from "./app.menuitem";
import { AuthenticationService } from "../../features/authentication/services/authentication.service";
import { Permissions } from "../../constants/permissions";

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
        visible: this.authenticationService.checkPermission(
          Permissions.CanGetAdministrators,
        ),
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
        visible: this.authenticationService.checkPermission(
          Permissions.CanGetAppointments,
        ),
        items: [
          {
            label: "Appointments",
            icon: "pi pi-fw pi-calendar",
            routerLink: ["/admin/appointments"],
          },
          {
            label: "Appointment Types",
            icon: "pi pi-fw pi-bookmark",
            routerLink: ["/admin/appointments/appointment-types"],
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
        visible: this.authenticationService.checkPermission(
          Permissions.CanGetClients,
        ),
        items: [
          {
            label: "Clients",
            icon: "pi pi-fw pi-book",
            routerLink: ["/admin/clients"],
          },
        ],
      },
      {
        label: "Users",
        visible: this.authenticationService.checkPermission(
          Permissions.CanGetUsers,
        ),
        items: [
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
        ],
      },
    ];
  }
}
