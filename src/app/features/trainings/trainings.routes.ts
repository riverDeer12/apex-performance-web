import {Routes} from "@angular/router";
import {TrainingsComponent} from "./trainings.component";

export const TrainingsRoutes: Routes = [
    {
        path: "",
        component: TrainingsComponent,
        data: { title: "menu.trainings", section: "menu.trainings" },
    },
];
