import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { Select } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { Checkbox } from "primeng/checkbox";
import { Textarea } from "primeng/textarea";
import { MessageService } from "primeng/api";
import { ActionType } from "../../../../enums/action-type";
import { RedirectType } from "../../../../enums/redirect-type";
import { ValidationService } from "../../../../shared/services/validation.service";
import { HelperService } from "../../../../shared/services/helper.service";
import { getErrorMessage } from "../../../../constants/error-codes";
import { TranslationService } from "../../../../i18n/translation.service";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { ClientService } from "../../../clients/services/client.service";
import { Client } from "../../../clients/models/client";
import { WorkoutService } from "../../../workouts/services/workout.service";
import { Workout } from "../../../workouts/models/workout";
import { getTranslation } from "../../../workouts/models/localized-property";
import { Training, TrainingExercise, TrainingExerciseSet, TrainingRequest } from "../../models/training";
import { TrainingService } from "../../services/training.service";

@Component({
    selector: "app-training-form",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, Button, InputText, Select, DatePicker, Checkbox, Textarea,
        TranslatePipe],
    templateUrl: "./training-form.component.html",
})
export class TrainingFormComponent implements OnInit {
    @Input() type!: ActionType;
    @Input() training!: Training;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    loadingData = false;

    clients: Client[] = [];

    workoutOptions: { label: string; value: string }[] = [];

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private helperService: HelperService,
        private trainingService: TrainingService,
        private clientService: ClientService,
        private workoutService: WorkoutService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {}

    get exercises(): FormArray<FormGroup> {
        return this.form.get("exercises") as FormArray<FormGroup>;
    }

    ngOnInit(): void {
        this.initForm();
        this.loadClients();
        this.loadWorkouts();
    }

    addExercise(exercise?: TrainingExercise): void {
        const group = this.formBuilder.group({
            workout: [exercise?.workoutId ?? null, [Validators.required]],
            note: [exercise?.note ?? "", [Validators.maxLength(500)]],
            sets: this.formBuilder.array<FormGroup>([]),
        });

        this.exercises.push(group);

        const sets = [...(exercise?.sets ?? [])].sort((a, b) => a.order - b.order);

        // New exercise starts with one empty set.
        (sets.length ? sets : [undefined]).forEach(set => this.addSet(this.exercises.length - 1, set));
    }

    setsOf(exerciseIndex: number): FormArray<FormGroup> {
        return this.exercises.at(exerciseIndex).get("sets") as FormArray<FormGroup>;
    }

    /**
     * Add set to exercise. Without values the last set is
     * copied, as sets usually repeat or change only a little.
     */
    addSet(exerciseIndex: number, set?: TrainingExerciseSet): void {
        const sets = this.setsOf(exerciseIndex);
        const previous = sets.length ? sets.at(sets.length - 1).value : null;

        sets.push(this.formBuilder.group({
            reps: [set ? set.reps ?? "" : previous?.reps ?? "", [Validators.maxLength(50)]],
            weight: [set ? set.weight ?? null : previous?.weight ?? null, [Validators.min(0), Validators.max(9999)]],
        }));
    }

    /**
     * Show as many set rows as chosen. New sets copy the
     * last one, extra sets are removed from the end.
     */
    setSetCount(exerciseIndex: number, value: string | number): void {
        if (value === "" || value === null) return;

        const count = Math.min(Math.max(Math.floor(Number(value) || 0), 0), 50);
        const sets = this.setsOf(exerciseIndex);

        while (sets.length < count) this.addSet(exerciseIndex);
        while (sets.length > count) sets.removeAt(sets.length - 1);
    }

    removeSet(exerciseIndex: number, setIndex: number): void {
        this.setsOf(exerciseIndex).removeAt(setIndex);
    }

    removeExercise(index: number): void {
        this.exercises.removeAt(index);
    }

    moveExercise(index: number, direction: -1 | 1): void {
        const target = index + direction;

        if (target < 0 || target >= this.exercises.length) return;

        const exercise = this.exercises.at(index);
        this.exercises.removeAt(index);
        this.exercises.insert(target, exercise);
    }

    exerciseHasError(index: number, field: string, error: string): boolean {
        const control = this.exercises.at(index).get(field);

        return !!control && control.touched && control.hasError(error);
    }

    submit(): void {
        this.loadingData = true;

        if (this.form.invalid) {
            this.form.markAllAsTouched();

            this.messageService.add({
                severity: "warn",
                summary: this.translationService.t("common.incompleteTitle"),
                detail: this.translationService.t("common.incompleteDetail"),
            });

            this.loadingData = false;

            return;
        }

        const request = this.toRequest();

        const save$ = this.type == ActionType.Create
            ? this.trainingService.createTraining(request)
            : this.trainingService.updateTraining(this.training.id, request);

        save$.subscribe({
            next: () => {
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t(this.type == ActionType.Create
                        ? "trainings.createdDetail"
                        : "trainings.updatedDetail"),
                });

                this.loadingData = false;

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("trainings.saveErrorSummary"),
                    detail: getErrorMessage(error),
                });

                this.loadingData = false;
            },
        });
    }

    private initForm(): void {
        const training = this.type == ActionType.Update ? this.training : null;

        this.form = this.formBuilder.group({
            client: [training?.client?.id ?? null, [Validators.required]],
            name: [training?.name ?? "", [Validators.required, Validators.maxLength(200)]],
            date: [training ? new Date(training.date) : new Date(), [Validators.required]],
            note: [training?.note ?? "", [Validators.maxLength(2000)]],
            isCompleted: [training?.isCompleted ?? false],
            exercises: this.formBuilder.array<FormGroup>([]),
        });

        [...(training?.exercises ?? [])]
            .sort((a, b) => a.order - b.order)
            .forEach(exercise => this.addExercise(exercise));
    }

    private toRequest(): TrainingRequest {
        const value = this.form.value;
        const text = (x: string | null | undefined) => x?.trim() ? x.trim() : null;
        const number = (x: number | string | null | undefined) =>
            x === null || x === undefined || x === "" ? null : Number(x);

        return {
            client: value.client,
            name: value.name.trim(),
            date: (value.date as Date).toISOString(),
            note: text(value.note),
            isCompleted: !!value.isCompleted,
            exercises: (value.exercises ?? []).map((x: any) => ({
                workout: x.workout,
                note: text(x.note),
                // Sets without repetitions and weight are not saved.
                sets: (x.sets ?? [])
                    .map((set: any) => ({ reps: text(set.reps), weight: number(set.weight) }))
                    .filter((set: { reps: string | null; weight: number | null }) =>
                        set.reps !== null || set.weight !== null),
            })),
        };
    }

    private loadClients(): void {
        this.clientService.getClients().subscribe((response: Client[]) => {
            this.clients = response
                .filter(x => !x.isDeleted)
                .map(x => Object.assign(new Client(), x));
        });
    }

    private loadWorkouts(): void {
        const language = this.translationService.language();

        this.workoutService.getWorkouts().subscribe((response: Workout[]) => {
            this.workoutOptions = response
                .map(x => ({ label: getTranslation(x.name, language), value: x.id }))
                .sort((a, b) => a.label.localeCompare(b.label, language));
        });
    }
}
