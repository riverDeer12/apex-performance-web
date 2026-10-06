import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { TableModule } from "primeng/table";
import { Tag } from "primeng/tag";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { getTranslation } from "../../../workouts/models/localized-property";
import { Training, TrainingExercise } from "../../models/training";

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

    workoutName(exercise: TrainingExercise): string {
        return getTranslation(exercise.workoutName, this.translationService.language());
    }
}
