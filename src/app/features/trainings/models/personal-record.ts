import { PaceType } from "./training";

// LongestDuration: value is seconds, for workouts done for a time (e.g. plank).
// LongestDistance: metres; FastestPace: average speed in metres per minute,
// shown as the workout's pace (workouts with a pace type, e.g. rowing).
export type PersonalRecordType = "MaxWeight" | "EstimatedOneRepMax" | "LongestDuration" | "LongestDistance" | "FastestPace";

export class PersonalRecord {
    id!: string;
    clientId!: string;
    workoutId!: string;
    // Persisted JSON with workout name translations.
    workoutName!: string;
    trainingId!: string;
    type!: PersonalRecordType;
    value!: number;
    weight!: number;
    reps?: number | null;
    achievedAt!: string;
    paceType?: PaceType | null;
}
