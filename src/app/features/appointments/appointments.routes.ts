import {Routes} from "@angular/router";
import {Permissions} from "../../constants/permissions";
import {AppointmentsComponent} from "./appointments.component";
import {AppointmentTypesComponent} from './components/appointment-types/appointment-types.component';

export const AppointmentsRoutes: Routes = [
    {
        path: "",
        component: AppointmentsComponent,
        data: {
            permissions: [Permissions.CanGetAppointments],
        }
    },
    {
        path: 'appointment-types',
        component: AppointmentTypesComponent,
        data: {
            permissions: [Permissions.CanGetAppointmentTypes]
        }
    }
];
