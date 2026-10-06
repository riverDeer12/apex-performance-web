export class TrainingExerciseSet {
    id!: string;
    order!: number;
    reps?: string | null;
    weight?: number | null;
}

export class TrainingExercise {
    id!: string;
    workoutId!: string;
    // Persisted JSON with workout name translations.
    workoutName!: string;
    order!: number;
    note?: string | null;
    sets!: TrainingExerciseSet[];
}

export class TrainingClient {
    id!: string;
    firstName!: string;
    lastName!: string;
    fullName!: string;
}

export class Training {
    id!: string;
    name!: string;
    date!: string;
    note?: string | null;
    isCompleted!: boolean;
    completedAt?: string | null;
    client!: TrainingClient;
    exercises!: TrainingExercise[];
    createdAt!: string;
    updatedAt!: string;
}

export interface TrainingExerciseSetRequest {
    reps: string | null;
    weight: number | null;
}

export interface TrainingExerciseRequest {
    workout: string;
    note: string | null;
    sets: TrainingExerciseSetRequest[];
}

export interface TrainingRequest {
    client: string;
    name: string;
    date: string;
    note: string | null;
    isCompleted: boolean;
    exercises: TrainingExerciseRequest[];
}
