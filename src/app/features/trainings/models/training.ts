export class TrainingExerciseSet {
    id!: string;
    order!: number;
    reps?: string | null;
    weight?: number | null;
    // Done right after the previous set without rest, with less weight (drop set).
    // Never true on the first set of an exercise.
    isDropSet?: boolean;
    // How long the set lasted, for exercises done for a time (e.g. plank).
    durationSeconds?: number | null;
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
    durationSeconds: number | null;
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

// "90", "1:30" (min:s) or "1:02:30" (h:min:s).
export const DURATION_PATTERN = /^\s*\d{1,5}(:[0-5]?\d){0,2}\s*$/;

/**
 * Seconds from a duration typed as seconds, min:s or h:min:s, null when empty or not valid.
 */
export function parseDuration(text: string | null | undefined): number | null {
    if (!text?.trim() || !DURATION_PATTERN.test(text)) return null;

    const seconds = text.trim().split(":").map(Number).reduce((total, part) => total * 60 + part, 0);
    return seconds > 0 ? seconds : null;
}

/**
 * Duration as min:s (or h:min:s from an hour on), e.g. 90 -> "1:30".
 */
export function formatDuration(seconds: number | null | undefined): string {
    if (!seconds) return "";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = String(seconds % 60).padStart(2, "0");

    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

/**
 * One set as shown in lists: "10 × 80 kg", or "1:30" / "1:30 · 10 kg" for a set done for a time.
 */
export function describeSet(set: TrainingExerciseSet): string {
    const weight = set.weight != null ? `${set.weight} kg` : "";

    if (set.durationSeconds) {
        const duration = formatDuration(set.durationSeconds);
        const reps = set.reps ? ` · ${set.reps}` : "";
        return duration + reps + (weight ? ` · ${weight}` : "");
    }

    return (set.reps || "-") + (weight ? ` × ${weight}` : "");
}
