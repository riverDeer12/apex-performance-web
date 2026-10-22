import {LocalizedProperty} from "./localized-property";
import {WorkoutType} from "./workout-type";

// Muscle codes that API accepts, translated with "muscles.<code>" keys.
export const MUSCLES = [
    "chest", "shoulders", "biceps", "triceps", "forearms", "abs", "obliques", "traps",
    "upper_back", "lats", "lower_back", "glutes", "quads", "hamstrings", "adductors", "calves",
];

export class Workout {
    id!: string;
    name!: LocalizedProperty;
    description!: LocalizedProperty;
    thumbnailUrl!: string;
    videoUrl!: string;
    workoutTypes!: WorkoutType[];
    // Muscle codes, primary ones do most of the work and secondary ones
    // help; a muscle is never in both. Guessed from the name by API until set.
    muscles!: string[];
    secondaryMuscles!: string[];
    // Done for a time (e.g. plank): sets record a duration instead of repetitions.
    isTimed!: boolean;

    // Values translated to currently selected
    // language, used for table display and filtering.
    displayName!: string;
    displayDescription!: string;
    displayWorkoutTypes!: string;
    displayWorkoutTypeList!: string[];
    displayMuscleList!: string[];
    displaySecondaryMuscleList!: string[];
    displayMuscles!: string;
}

export class WorkoutRequest {
    name!: LocalizedProperty;
    description!: LocalizedProperty;
    thumbnailUrl!: string;
    videoUrl!: string;
    workoutTypes!: string[];
    // Left out, API keeps them (or guesses them from the name for a new workout).
    muscles?: string[];
    secondaryMuscles?: string[];
    // Left out, API keeps the current value.
    isTimed?: boolean;
}
