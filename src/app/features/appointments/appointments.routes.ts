import {Routes} from "@angular/router";
import {Permissions} from "../../constants/permissions";
import {AppointmentsComponent} from "./appointments.component";
import {AppointmentTypesComponent} from './appointment-types/components/appointment-types/appointment-types.component';
import {AppointmentRequestsComponent} from "./appointment-requests/components/appointment-requests/appointment-requests.component";
import {AppointmentLocationsComponent} from "./appointment-locations/components/appointment-locations/appointment-locations.component";
import { PendingAppointmentsComponent } from "./pending-appointments/pending-appointments.component";
import { RecurringAppointmentsComponent } from "./recurring-appointments/components/recurring-appointments/recurring-appointments.component";

export const AppointmentsRoutes: Routes = [
    {
        path: "",
        component: AppointmentsComponent,
        data: {
            title: "menu.appointmentsHistory", section: "menu.appointments",
            permissions: [Permissions.CanGetAppointments],
        }
    },
    {
        path: 'appointment-types',
        component: AppointmentTypesComponent,
        data: {
            title: "menu.appointmentTypes", section: "menu.appointments",
            permissions: [Permissions.CanGetAppointmentTypes]
        }
    },
    {
        path: 'appointment-locations',
        component: AppointmentLocationsComponent,
        data: { title: "menu.appointmentLocations", section: "menu.appointments" },
    },
    {
        path: 'appointment-requests',
        component: PendingAppointmentsComponent,
        data: { title: "menu.appointmentRequests", section: "menu.requests" },
    },
    {
        path: 'cancelation-requests',
        component: AppointmentRequestsComponent,
        data: { title: "menu.cancelationRequests", section: "menu.requests", requestType: "CancelationRequest" },
    },
    {
        path: 'join-requests',
        component: AppointmentRequestsComponent,
        data: { title: "menu.joinRequests", section: "menu.requests", requestType: "JoinRequest" },
    },
    {
        path: 'recurring-appointments',
        component: RecurringAppointmentsComponent,
        data: {
            title: "menu.recurringAppointments", section: "menu.appointments",
            permissions: [Permissions.CanGetRecurringAppointments]
        }
    }
];
