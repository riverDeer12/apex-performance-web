import {Routes} from "@angular/router";
import {TrainingsComponent} from "./trainings.component";
import {TrainingProgressComponent} from "./components/training-progress/training-progress.component";

export const TrainingsRoutes: Routes = [
    {
        path: "",
        component: TrainingsComponent,
        data: { title: "menu.trainings", section: "menu.trainings" },
    },
    {
        path: "progress",
        component: TrainingProgressComponent,
        data: { title: "menu.trainingProgress", section: "menu.trainings" },
    },
];
