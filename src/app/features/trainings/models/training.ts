export class TrainingExercise {
    id!: string;
    workoutId!: string;
    // Persisted JSON with workout name translations.
    workoutName!: string;
    order!: number;
    sets?: number | null;
    reps?: string | null;
    weight?: number | null;
    note?: string | null;
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

export interface TrainingExerciseRequest {
    workout: string;
    sets: number | null;
    reps: string | null;
    weight: number | null;
    note: string | null;
}

export interface TrainingRequest {
    client: string;
    name: string;
    date: string;
    note: string | null;
    isCompleted: boolean;
    exercises: TrainingExerciseRequest[];
}
