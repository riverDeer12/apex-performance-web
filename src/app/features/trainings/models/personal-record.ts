// LongestDuration: value is seconds, for workouts done for a time (e.g. plank).
export type PersonalRecordType = "MaxWeight" | "EstimatedOneRepMax" | "LongestDuration";

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
}
