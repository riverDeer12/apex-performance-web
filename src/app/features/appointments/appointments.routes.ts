import {Routes} from "@angular/router";
import {Permissions} from "../../constants/permissions";
import {AppointmentsComponent} from "./appointments.component";
import {AppointmentTypesComponent} from './appointment-types/components/appointment-types/appointment-types.component';
import {AppointmentRequestsComponent} from "./appointment-requests/components/appointment-requests/appointment-requests.component";
import { RecurringAppointmentsComponent } from "./recurring-appointments/components/recurring-appointments/recurring-appointments.component";

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
    },
    {
        path: 'appointment-requests',
        component: AppointmentRequestsComponent,
        data: {
            permissions: [Permissions.CanGetAppointmentRequests]
        }
    },
    {
        path: 'recurring-appointments',
        component: RecurringAppointmentsComponent,
        data: {
            permissions: [Permissions.CanGetRecurringAppointments]
        }
    }
];
