import {Routes} from "@angular/router";
import {UsersComponent} from "./users.component";
import {RolesComponent} from "../roles/roles/roles.component";
import {Permissions} from "../../constants/permissions";
import { LogsComponent } from "./components/logs/logs.component";

export const UsersRoutes: Routes = [
    {
        path: '',
        component: UsersComponent,
        data: {
            permissions: [Permissions.CanGetUsers]
        }
    },
    {
        path: 'roles',
        component: RolesComponent,
        data: {
            permissions: [Permissions.CanGetRoles]
        }
    },
    {
        path: 'logs',
        component: LogsComponent,
        data: {
            permissions: [Permissions.CanGetLogs]
        }
    }
]
