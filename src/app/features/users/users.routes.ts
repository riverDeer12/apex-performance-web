import { Routes } from "@angular/router";
import { UsersComponent } from "./users.component";
import { RolesComponent } from "../roles/roles/roles.component";
import { Permissions } from "../../constants/permissions";
import { LogsComponent } from "./components/logs/logs.component";
import { DeviceTokensComponent } from "../device-tokens/device-tokens.component";
import { UserSessionsComponent } from "../user-sessions/user-sessions.component";

export const UsersRoutes: Routes = [
  {
    path: "",
    component: UsersComponent,
    data: {
      title: "menu.users", section: "menu.users",
      permissions: [Permissions.CanGetUsers]
    }
  },
  {
    path: "device-tokens",
    component: DeviceTokensComponent,
    data: { title: "menu.deviceTokens", section: "menu.users" },
  },
  {
    path: "sessions",
    component: UserSessionsComponent,
    data: { title: "menu.userSessions", section: "menu.users" },
  },
  {
    path: "roles",
    component: RolesComponent,
    data: {
      title: "menu.userRoles", section: "menu.users",
      permissions: [Permissions.CanGetRoles]
    }
  },
  {
    path: "logs",
    component: LogsComponent,
    data: {
      title: "menu.logs", section: "menu.users",
      permissions: [Permissions.CanGetLogs]
    }
  }
];
