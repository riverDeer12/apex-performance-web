import {Routes} from "@angular/router";
import {WorkoutsComponent} from "./workouts.component";
import {WorkoutTypesComponent} from "./components/workout-types/workout-types.component";

export const WorkoutsRoutes: Routes = [
    {
        path: "",
        component: WorkoutsComponent,
        data: { title: "menu.workouts", section: "menu.workouts" },
    },
    {
        path: "types",
        component: WorkoutTypesComponent,
        data: { title: "menu.workoutTypes", section: "menu.workouts" },
    },
];
