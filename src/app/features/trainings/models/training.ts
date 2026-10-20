export class TrainingExerciseSet {
    id!: string;
    order!: number;
    reps?: string | null;
    weight?: number | null;
    // Done right after the previous set without rest, with less weight (drop set).
    // Never true on the first set of an exercise.
    isDropSet?: boolean;
}

export class TrainingExercise {
    id!: string;
    workoutId!: string;
    // Persisted JSON with workout name translations.
    workoutName!: string;
    order!: number;
    note?: string | null;
    sets!: TrainingExerciseSet[];
    // Done right after the previous exercise without rest (superset).
    isSupersetWithPrevious?: boolean;
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
    // API ignores it on the first set.
    isDropSet: boolean;
}

export interface TrainingExerciseRequest {
    workout: string;
    note: string | null;
    sets: TrainingExerciseSetRequest[];
    isSupersetWithPrevious: boolean;
}

export interface TrainingRequest {
    client: string;
    name: string;
    date: string;
    note: string | null;
    isCompleted: boolean;
    // Push notification to the client.
    notifyClient?: boolean;
    exercises: TrainingExerciseRequest[];
}

export interface NumberedSet {
    set: TrainingExerciseSet;
    // Number of the set, null for its drops (they belong to the set above them).
    number: number | null;
}

/**
 * Sets in order with their numbers. Drops are not counted as separate
 * sets, they are shown indented under the set they belong to.
 */
export function numberSets(sets: TrainingExerciseSet[] | null | undefined): NumberedSet[] {
    let number = 0;

    return [...(sets ?? [])]
        .sort((a, b) => a.order - b.order)
        .map((set, index) => {
            const isDrop = index > 0 && !!set.isDropSet;
            if (!isDrop) number++;

            return { set, number: isDrop ? null : number };
        });
}
