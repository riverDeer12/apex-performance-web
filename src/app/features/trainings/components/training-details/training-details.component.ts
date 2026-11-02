import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { TableModule } from "primeng/table";
import { Tag } from "primeng/tag";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { getTranslation } from "../../../workouts/models/localized-property";
import { describeSet, NumberedSet, numberSets, Training, TrainingExercise, trainingMinutes } from "../../models/training";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { Roles } from "../../../../constants/roles";

/**
 * Read only view of a training with its exercises,
 * used by clients and from the trainings table.
 */
@Component({
    selector: "app-training-details",
    standalone: true,
    imports: [CommonModule, TableModule, Tag, TranslatePipe],
    templateUrl: "./training-details.component.html",
    styles: [`
        .stat-box { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.75rem 1rem;
            border: 1px solid var(--surface-border); border-radius: var(--content-border-radius); min-width: 11rem; }
        .stat-label { font-size: 0.8rem; font-weight: 600; color: var(--text-color-secondary); }
        .stat-value { font-size: 1.25rem; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--text-color); }
        .stat-note { font-size: 0.8rem; color: var(--text-color-secondary); }
        .heart .stat-label i { color: #e5484d; }
    `],
})
export class TrainingDetailsComponent {
    readonly describeSet = describeSet;

    training: Training;

    exercises: TrainingExercise[];

    // Sets of each exercise with their numbers (drops are not numbered).
    setRows: NumberedSet[][];

    // Clients only receive completed trainings, completion status is shown to staff only.
    isClient: boolean;

    // Length of the training, null while it is not ended.
    minutes: number | null;

    constructor(config: DynamicDialogConfig, private translationService: TranslationService,
                authenticationService: AuthenticationService) {
        this.isClient = authenticationService.getUserRole() === Roles.Client;
        this.training = config.data.training;
        this.exercises = [...(this.training.exercises ?? [])].sort((a, b) => a.order - b.order);
        this.setRows = this.exercises.map(x => numberSets(x.sets));
        this.minutes = trainingMinutes(this.training);
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

    workoutName(exercise: TrainingExercise): string {
        return getTranslation(exercise.workoutName, this.translationService.language());
    }
}
