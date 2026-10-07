import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { TableModule } from "primeng/table";
import { Tag } from "primeng/tag";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { getTranslation } from "../../../workouts/models/localized-property";
import { Training, TrainingExercise, TrainingExerciseSet } from "../../models/training";

/**
 * Read only view of a training with its exercises,
 * used by clients and from the trainings table.
 */
@Component({
    selector: "app-training-details",
    standalone: true,
    imports: [CommonModule, TableModule, Tag, TranslatePipe],
    templateUrl: "./training-details.component.html",
})
export class TrainingDetailsComponent {
    training: Training;

    exercises: TrainingExercise[];

    constructor(config: DynamicDialogConfig, private translationService: TranslationService) {
        this.training = config.data.training;
        this.exercises = [...(this.training.exercises ?? [])].sort((a, b) => a.order - b.order);
    }

    /**
     * Number for single exercises, number with a letter
     * for exercises of a superset (2a, 2b).
     */
    exerciseLabel(index: number): string {
        let number = 0;
        let letter = 0;

        for (let i = 0; i <= index; i++) {
            if (i > 0 && this.exercises[i].isSupersetWithPrevious) letter++;
            else { number++; letter = 0; }
        }

        return this.isSuperset(index) ? `${number}${String.fromCharCode(97 + letter)}` : `${number}`;
    }

    isSuperset(index: number): boolean {
        return (index > 0 && !!this.exercises[index].isSupersetWithPrevious) ||
            (index + 1 < this.exercises.length && !!this.exercises[index + 1].isSupersetWithPrevious);
    }

    sortedSets(exercise: TrainingExercise): TrainingExerciseSet[] {
        return [...(exercise.sets ?? [])].sort((a, b) => a.order - b.order);
    }

    workoutName(exercise: TrainingExercise): string {
        return getTranslation(exercise.workoutName, this.translationService.language());
    }
}
