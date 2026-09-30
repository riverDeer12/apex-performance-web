import {Routes} from "@angular/router";
import {Permissions} from "../../constants/permissions";
import {CoachesComponent} from "./coaches.component";
import {TimeSlotsComponent} from "../time-slots/time-slots.component";

export const CoachesRoutes: Routes = [
    {
        path: "",
        component: CoachesComponent,
        data: {
            title: "menu.coaches", section: "menu.coaches",
            permissions: [Permissions.CanGetCoaches],
        },
    }
];
