import {Routes} from "@angular/router";
import {Permissions} from "../../constants/permissions";
import {TimeSlotsComponent} from './time-slots.component';

export const TimeSlotsRoutes: Routes = [
    {
        path: "",
        component: TimeSlotsComponent,
        data: {
            permissions: [Permissions.CanGetTimeSlots],
        },
    }
];
