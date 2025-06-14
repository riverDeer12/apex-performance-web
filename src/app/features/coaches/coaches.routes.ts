import {Routes} from "@angular/router";
import {Permissions} from "../../constants/permissions";
import {CoachesComponent} from "./coaches.component";

export const CoachesRoutes: Routes = [
    {
        path: "",
        component: CoachesComponent,
        data: {
            permissions: [Permissions.CanGetCoaches],
        },
    },
];
