import { Routes } from '@angular/router';
import { AdministratorsComponent } from './administrators.component';
import {Permissions} from "../../constants/permissions";

export const AdministratorsRoutes: Routes = [
    {
        path: '',
        component: AdministratorsComponent,
        data: {
            permissions: [Permissions.CanGetAdministrators]
        }
    }
];
