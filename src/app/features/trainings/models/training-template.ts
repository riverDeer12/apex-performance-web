import { TrainingExercise, TrainingExerciseRequest } from "./training";

export class TrainingTemplate {
    id!: string;
    name!: string;
    note?: string | null;
    exercises!: TrainingExercise[];
    authorName?: string | null;
    // Only the author and administrators can change the template.
    canEdit!: boolean;
    createdAt!: string;
    updatedAt!: string;
}

export interface TrainingTemplateRequest {
    name: string;
    note: string | null;
    exercises: TrainingExerciseRequest[];
}
