import {Routes} from "@angular/router";
import {TrainingsComponent} from "./trainings.component";
import {TrainingProgressComponent} from "./components/training-progress/training-progress.component";
import {TrainingTemplatesComponent} from "./components/training-templates/training-templates.component";
import {PersonalRecordsComponent} from "./components/personal-records/personal-records.component";

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
    {
        path: "templates",
        component: TrainingTemplatesComponent,
        data: { title: "menu.trainingTemplates", section: "menu.trainings" },
    },
    {
        path: "records",
        component: PersonalRecordsComponent,
        data: { title: "menu.personalRecords", section: "menu.trainings" },
    },
];
