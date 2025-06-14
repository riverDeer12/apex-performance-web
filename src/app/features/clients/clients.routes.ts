import {Routes} from "@angular/router";
import {Permissions} from "../../constants/permissions";
import {ClientsComponent} from "./clients.component";

export const ClientsRoutes: Routes = [
    {
        path: "",
        component: ClientsComponent,
        data: {
            permissions: [Permissions.CanGetClients],
        },
    },
];
