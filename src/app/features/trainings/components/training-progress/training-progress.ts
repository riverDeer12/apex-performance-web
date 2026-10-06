import { Training } from "../../models/training";

export type MuscleGroup = "legs" | "back" | "chest" | "shoulders" | "arms" | "core";

export const MUSCLE_GROUPS: MuscleGroup[] = ["legs", "back", "chest", "shoulders", "arms", "core"];

// Workout type names (any language, lower case) that belong to a muscle group.
// Imported workouts use english muscle names, manually added types are croatian.
const MUSCLE_GROUP_KEYWORDS: Record<MuscleGroup, string[]> = {
    legs: ["quadriceps", "hamstrings", "glutes", "calves", "adductors", "abductors", "legs",
        "noge", "kvadriceps", "stražnja loža", "stražnjica", "gluteus", "listovi", "aduktori", "abduktori"],
    back: ["lats", "middle back", "lower back", "traps", "back",
        "leđa", "latissimus", "donja leđa", "srednja leđa", "trapez"],
    chest: ["chest", "prsa", "prsni"],
    shoulders: ["shoulders", "ramena", "rame", "deltoidi"],
    arms: ["biceps", "triceps", "forearms", "arms", "ruke", "podlaktice", "bicepsi", "tricepsi"],
    core: ["abdominals", "core", "abs", "trbuh", "trbušnjaci", "trup"],
};

export interface SetData {
    reps: number | null;
    weight: number | null;
}

export interface ExerciseData {
    workoutId: string;
    sets: SetData[];
}

export interface WorkoutPoint {
    date: Date;
    totalReps: number;
    avgRepsPerSet: number | null;
    exercises: ExerciseData[];
}

/**
 * Reps are free text: "10" or a range "8-12" (its middle is used).
 * Anything else, like "30 s", is not counted as repetitions.
 */
export function parseReps(value: string | null | undefined): number | null {
    const match = /^\s*(\d+(?:[.,]\d+)?)\s*(?:-\s*(\d+(?:[.,]\d+)?))?\s*$/.exec(value ?? "");

    if (!match) return null;

    const from = Number(match[1].replace(",", "."));
    const to = match[2] ? Number(match[2].replace(",", ".")) : from;

    return (from + to) / 2;
}

/**
 * Completed trainings of a client from given date, oldest first.
 */
export function toWorkoutPoints(trainings: Training[], clientId: string | null, from: Date): WorkoutPoint[] {
    return trainings
        .filter(x => x.isCompleted && x.client?.id === clientId && new Date(x.date) >= from)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(training => {
            const exercises: ExerciseData[] = (training.exercises ?? []).map(exercise => ({
                workoutId: exercise.workoutId,
                sets: (exercise.sets ?? []).map(set => ({
                    reps: parseReps(set.reps),
                    weight: set.weight != null ? Number(set.weight) : null,
                })),
            }));

            const repsPerSet = exercises.flatMap(x => x.sets).map(x => x.reps).filter((x): x is number => x != null);
            const totalReps = repsPerSet.reduce((sum, x) => sum + x, 0);

            return {
                date: new Date(training.date),
                totalReps,
                avgRepsPerSet: repsPerSet.length ? totalReps / repsPerSet.length : null,
                exercises,
            };
        });
}

/**
 * Estimated one rep max (Epley), the best set of an exercise
 * in one workout. Sets without weight are not counted.
 */
function bestEstimatedMax(sets: SetData[]): number | null {
    const values = sets
        .filter(x => x.weight != null && x.weight > 0)
        .map(x => x.weight! * (1 + (x.reps ?? 1) / 30));

    return values.length ? Math.max(...values) : null;
}

/**
 * Strength index per workout: every exercise's estimated max is compared
 * to the first time the client did that exercise in the period (= 100),
 * and the workout value is the average of its exercises. This way the
 * line shows progress even when workouts contain different exercises.
 */
export function strengthIndex(points: WorkoutPoint[]): { date: Date; value: number }[] {
    const baseline = new Map<string, number>();
    const result: { date: Date; value: number }[] = [];

    for (const point of points) {
        const ratios: number[] = [];

        for (const exercise of point.exercises) {
            const max = bestEstimatedMax(exercise.sets);
            if (max == null) continue;

            if (!baseline.has(exercise.workoutId)) baseline.set(exercise.workoutId, max);

            ratios.push(max / baseline.get(exercise.workoutId)! * 100);
        }

        if (ratios.length)
            result.push({ date: point.date, value: ratios.reduce((sum, x) => sum + x, 0) / ratios.length });
    }

    return result;
}

/**
 * Heaviest weight lifted in an exercise per workout.
 */
export function maxWeightPerWorkout(points: WorkoutPoint[], workoutId: string): { date: Date; value: number }[] {
    return points
        .map(point => {
            const weights = point.exercises
                .filter(x => x.workoutId === workoutId)
                .flatMap(x => x.sets)
                .map(x => x.weight)
                .filter((x): x is number => x != null && x > 0);

            return weights.length ? { date: point.date, value: Math.max(...weights) } : null;
        })
        .filter((x): x is { date: Date; value: number } => x != null);
}

/**
 * Monday of the week the date is in.
 */
export function startOfWeek(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
    return result;
}

/**
 * Number of completed workouts in every week from
 * the start of the period, weeks without workouts are 0.
 */
export function workoutsPerWeek(points: WorkoutPoint[], from: Date, to: Date): { date: Date; value: number }[] {
    const weeks: { date: Date; value: number }[] = [];

    for (let week = startOfWeek(from); week <= to; week = new Date(week.getFullYear(), week.getMonth(), week.getDate() + 7))
        weeks.push({ date: week, value: 0 });

    for (const point of points) {
        const week = startOfWeek(point.date).getTime();
        const item = weeks.find(x => x.date.getTime() === week);
        if (item) item.value++;
    }

    return weeks;
}

export function muscleGroupOf(typeNames: string[]): MuscleGroup | null {
    const names = typeNames.map(x => x.trim().toLowerCase());

    // Order of type names decides when an exercise has more groups,
    // imported workouts list primary muscles first.
    for (const name of names)
        for (const group of MUSCLE_GROUPS)
            if (MUSCLE_GROUP_KEYWORDS[group].includes(name)) return group;

    return null;
}

/**
 * Number of sets per muscle group, exercises without
 * a known muscle group are counted as "other".
 */
export function setsPerMuscleGroup(points: WorkoutPoint[],
                                   muscleGroupByWorkout: Map<string, MuscleGroup | null>): {
    groups: Record<MuscleGroup | "other", number>;
    total: number;
} {
    const groups = { legs: 0, back: 0, chest: 0, shoulders: 0, arms: 0, core: 0, other: 0 };

    for (const exercise of points.flatMap(x => x.exercises)) {
        const group = muscleGroupByWorkout.get(exercise.workoutId) ?? "other";
        groups[group] += exercise.sets.length;
    }

    return { groups, total: Object.values(groups).reduce((sum, x) => sum + x, 0) };
}

/**
 * Percentage change from first to last value, null when not comparable.
 */
export function percentChange(values: number[]): number | null {
    if (values.length < 2 || !values[0]) return null;
    return (values[values.length - 1] - values[0]) / values[0] * 100;
}
