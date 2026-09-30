import {Routes} from "@angular/router";
import {WorkoutsComponent} from "./workouts.component";

export const WorkoutsRoutes: Routes = [
    {
        path: "",
        component: WorkoutsComponent,
        data: { title: "menu.workouts", section: "menu.workouts" },
    },
];
