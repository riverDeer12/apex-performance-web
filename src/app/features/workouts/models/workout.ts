import {LocalizedProperty} from "./localized-property";
import {WorkoutType} from "./workout-type";

export class Workout {
    id!: string;
    name!: LocalizedProperty;
    description!: LocalizedProperty;
    thumbnailUrl!: string;
    videoUrl!: string;
    workoutTypes!: WorkoutType[];

    // Values translated to currently selected
    // language, used for table display and filtering.
    displayName!: string;
    displayDescription!: string;
    displayWorkoutTypes!: string;
    displayWorkoutTypeList!: string[];
}

export class WorkoutRequest {
    name!: LocalizedProperty;
    description!: LocalizedProperty;
    thumbnailUrl!: string;
    videoUrl!: string;
    workoutTypes!: string[];
}
