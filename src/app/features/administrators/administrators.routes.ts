import { Routes } from '@angular/router';
import { AdministratorsComponent } from './administrators.component';
import {Permissions} from "../../constants/permissions";

export const AdministratorsRoutes: Routes = [
    {
        path: '',
        component: AdministratorsComponent,
        data: {
            title: "menu.administrators", section: "menu.administrators",
            permissions: [Permissions.CanGetAdministrators]
        }
    }
];
