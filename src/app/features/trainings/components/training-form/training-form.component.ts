import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import {
    FormArray,
    FormBuilder,
    FormControl,
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
import { Tooltip } from "primeng/tooltip";
import { ConfirmationService, MessageService } from "primeng/api";
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
import {
    numberSets,
    NumberedSet,
    Training,
    TrainingExercise,
    TrainingExerciseSet,
    TrainingRequest,
    DURATION_PATTERN,
    describeSet,
    formatDuration,
    parseDuration,
} from "../../models/training";
import { TrainingService } from "../../services/training.service";
import { TrainingTemplate, TrainingTemplateRequest } from "../../models/training-template";
import { TrainingTemplateService } from "../../services/training-template.service";

@Component({
    selector: "app-training-form",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, Button, InputText, Select, DatePicker, Checkbox, Textarea,
        Tooltip, TranslatePipe],
    templateUrl: "./training-form.component.html",
    styleUrl: "./training-form.component.scss",
})
export class TrainingFormComponent implements OnInit {
    @Input() type!: ActionType;
    // Training, or a template when isTemplate is set (it has the same name, note and exercises).
    @Input() training!: Training;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    // Form edits a training template (no client, date or completion).
    // In create mode a given training or template is copied.
    @Input() isTemplate = false;

    form!: FormGroup;

    loadingData = false;

    clients: Client[] = [];

    workoutOptions: { label: string; value: string }[] = [];
    // Workouts done for a time (e.g. plank), their sets get a duration instead of repetitions.
    timedWorkoutIds = new Set<string>();

    // Templates a new training can be filled from.
    templates: TrainingTemplate[] = [];
    templatesLoaded = false;
    // Not part of the training, only picks the template to fill it from.
    templateControl = new FormControl<string | null>(null);

    // Trainings visible to the user, used to show what the
    // client did in the same exercise last time.
    private trainings: Training[] = [];

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private helperService: HelperService,
        private trainingService: TrainingService,
        private trainingTemplateService: TrainingTemplateService,
        private clientService: ClientService,
        private workoutService: WorkoutService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private translationService: TranslationService,
    ) {}

    // Only a new training is filled from a template, an edited one already has its exercises.
    get canUseTemplates(): boolean {
        return !this.isTemplate && this.type == ActionType.Create;
    }

    get exercises(): FormArray<FormGroup> {
        return this.form.get("exercises") as FormArray<FormGroup>;
    }

    ngOnInit(): void {
        this.initForm();
        this.loadWorkouts();

        if (this.isTemplate) return;

        this.loadClients();
        this.trainingService.getTrainings().subscribe(trainings => this.trainings = trainings);

        if (this.type == ActionType.Create)
            this.trainingTemplateService.getTemplates().subscribe(templates => {
                this.templates = templates;
                this.templatesLoaded = true;
            });
    }

    /**
     * Fill the training with name, note and exercises of the template.
     */
    applyTemplate(templateId: string | null): void {
        const template = this.templates.find(x => x.id === templateId);
        if (!template) return;

        // Exercises the coach already added would be replaced, so ask first.
        if (this.exercises.length) {
            this.confirmationService.confirm({
                header: this.translationService.t("trainingTemplates.replaceHeader"),
                message: this.translationService.t("trainingTemplates.replaceMessage"),
                icon: "pi pi-exclamation-triangle",
                acceptLabel: this.translationService.t("common.yes"),
                rejectLabel: this.translationService.t("common.no"),
                accept: () => this.fillFromTemplate(template),
                reject: () => this.templateControl.setValue(null, { emitEvent: false }),
            });
            return;
        }

        this.fillFromTemplate(template);
    }

    private fillFromTemplate(template: TrainingTemplate): void {
        this.form.patchValue({ name: template.name, note: template.note ?? "" });

        this.exercises.clear();
        [...template.exercises]
            .sort((a, b) => a.order - b.order)
            .forEach(exercise => this.addExercise(exercise));
    }

    addExercise(exercise?: TrainingExercise): void {
        this.insertExercise(this.exercises.length, exercise, !!exercise?.isSupersetWithPrevious);
    }

    /**
     * Add exercise that is done right after this one without rest.
     * It is added after the last exercise of the superset and gets
     * the same number of sets, as they are done together.
     */
    addSupersetExercise(exerciseIndex: number): void {
        const [, last] = this.supersetRange(exerciseIndex);
        const setCount = this.setCount(exerciseIndex);

        this.insertExercise(last + 1, undefined, true);
        this.setSetCount(last + 1, setCount);
    }

    isSuperset(exerciseIndex: number): boolean {
        const [first, last] = this.supersetRange(exerciseIndex);
        return last > first;
    }

    /**
     * Exercise label: number for single exercises, number with a letter
     * in supersets (2a, 2b), so exercises done together are recognizable.
     */
    exerciseLabel(exerciseIndex: number): string {
        let number = 0;
        let letter = 0;

        for (let i = 0; i <= exerciseIndex; i++) {
            if (this.isLinked(i)) {
                letter++;
            } else {
                number++;
                letter = 0;
            }
        }

        return this.isSuperset(exerciseIndex) ? `${number}${String.fromCharCode(97 + letter)}` : `${number}.`;
    }

    private isLinked(exerciseIndex: number): boolean {
        return exerciseIndex > 0 && !!this.exercises.at(exerciseIndex).get("isSupersetWithPrevious")?.value;
    }

    // First and last index of the superset the exercise belongs to.
    private supersetRange(exerciseIndex: number): [number, number] {
        let first = exerciseIndex;
        let last = exerciseIndex;

        while (this.isLinked(first)) first--;
        while (last + 1 < this.exercises.length && this.isLinked(last + 1)) last++;

        return [first, last];
    }

    private insertExercise(index: number, exercise: TrainingExercise | undefined, superset: boolean): void {
        const group = this.formBuilder.group({
            workout: [exercise?.workoutId ?? null, [Validators.required]],
            note: [exercise?.note ?? "", [Validators.maxLength(500)]],
            isSupersetWithPrevious: [superset],
            sets: this.formBuilder.array<FormGroup>([]),
        });

        this.exercises.insert(index, group);

        const sets = [...(exercise?.sets ?? [])].sort((a, b) => a.order - b.order);

        // New exercise starts with one empty set.
        (sets.length ? sets : [undefined]).forEach(set => this.addSet(index, set));
    }

    setsOf(exerciseIndex: number): FormArray<FormGroup> {
        return this.exercises.at(exerciseIndex).get("sets") as FormArray<FormGroup>;
    }

    /**
     * Add set to exercise. Without values the last set (not a drop) is
     * copied, as sets usually repeat or change only a little.
     */
    addSet(exerciseIndex: number, set?: TrainingExerciseSet): void {
        const sets = this.setsOf(exerciseIndex);
        const previous = [...sets.controls].reverse().find(x => !x.value.isDropSet)?.value ?? null;

        sets.push(this.createSet(set ?? {
            reps: previous?.reps,
            weight: previous?.weight,
            durationSeconds: parseDuration(previous?.duration),
        }, sets.length > 0));
    }

    /**
     * Add a drop to the set: it goes after the set's last drop
     * and starts with its values, the coach lowers the weight.
     */
    addDropSet(exerciseIndex: number, setIndex: number): void {
        const sets = this.setsOf(exerciseIndex);
        const end = this.setGroupEnd(exerciseIndex, setIndex);
        const previous = sets.at(end - 1).value;

        sets.insert(end, this.createSet({
            reps: previous.reps,
            weight: previous.weight,
            durationSeconds: parseDuration(previous.duration),
            isDropSet: true,
        }, true));
    }

    /**
     * Sets of the exercise record a duration: the workout is done for a time,
     * or a set already has one (also when the workout was changed since).
     */
    isTimed(exerciseIndex: number): boolean {
        const exercise = this.exercises.at(exerciseIndex);

        return this.timedWorkoutIds.has(exercise.get("workout")?.value) ||
            this.setsOf(exerciseIndex).controls.some(x => !!x.value.duration);
    }

    readonly describeSet = describeSet;

    isDropSet(exerciseIndex: number, setIndex: number): boolean {
        return setIndex > 0 && !!this.setsOf(exerciseIndex).at(setIndex).value.isDropSet;
    }

    // Number of the set shown in the form, drops are not counted.
    setNumber(exerciseIndex: number, setIndex: number): number {
        let number = 0;

        for (let s = 0; s <= setIndex; s++)
            if (!this.isDropSet(exerciseIndex, s)) number++;

        return number;
    }

    // Number of sets without drops.
    setCount(exerciseIndex: number): number {
        return this.setsOf(exerciseIndex).controls.filter((_, s) => !this.isDropSet(exerciseIndex, s)).length;
    }

    numberSets(sets: TrainingExerciseSet[]): NumberedSet[] {
        return numberSets(sets);
    }

    // Rows are rebuilt on every check, index keeps the same elements.
    trackByIndex(index: number): number {
        return index;
    }

    /**
     * Show as many sets as chosen (drops are not counted). New sets
     * copy the last one, extra sets are removed from the end with their drops.
     */
    setSetCount(exerciseIndex: number, value: string | number): void {
        if (value === "" || value === null) return;

        const count = Math.min(Math.max(Math.floor(Number(value) || 0), 0), 50);
        const [first, last] = this.supersetRange(exerciseIndex);

        // Exercises of a superset are done together, so they have the same number of sets.
        for (let i = first; i <= last; i++) {
            while (this.setCount(i) < count) this.addSet(i);
            while (this.setCount(i) > count) this.removeSet(i, this.lastSetIndex(i));
        }
    }

    /**
     * Sets of the same exercise from client's latest training
     * before this one, or null when the client didn't do it yet.
     */
    previousSets(exerciseIndex: number): { date: string; sets: TrainingExerciseSet[] } | null {
        if (this.isTemplate) return null;

        const clientId = this.form.controls["client"].value;
        const workoutId = this.exercises.at(exerciseIndex).get("workout")?.value;

        if (!clientId || !workoutId) return null;

        const date = this.form.controls["date"].value as Date | null;
        const before = date ? date.getTime() : Number.MAX_SAFE_INTEGER;

        const previous = this.trainings
            .filter(training => training.client?.id === clientId &&
                training.id !== this.training?.id &&
                new Date(training.date).getTime() <= before)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(training => ({
                date: training.date,
                exercise: training.exercises.find(x => x.workoutId === workoutId && x.sets?.length),
            }))
            .find(x => !!x.exercise);

        return previous
            ? { date: previous.date, sets: [...previous.exercise!.sets].sort((a, b) => a.order - b.order) }
            : null;
    }

    /**
     * Replace exercise sets with the ones from the previous training.
     */
    usePreviousSets(exerciseIndex: number): void {
        const previous = this.previousSets(exerciseIndex);
        if (!previous) return;

        this.setsOf(exerciseIndex).clear();
        previous.sets.forEach(set => this.addSet(exerciseIndex, set));
    }

    /**
     * Remove a set with its drops (they can't be done without it), or a single drop.
     */
    removeSet(exerciseIndex: number, setIndex: number): void {
        const sets = this.setsOf(exerciseIndex);
        const end = this.isDropSet(exerciseIndex, setIndex) ? setIndex + 1 : this.setGroupEnd(exerciseIndex, setIndex);

        for (let s = end - 1; s >= setIndex; s--) sets.removeAt(s);
    }

    // Index after the last drop of the set.
    private setGroupEnd(exerciseIndex: number, setIndex: number): number {
        const sets = this.setsOf(exerciseIndex);
        let end = setIndex + 1;

        while (end < sets.length && this.isDropSet(exerciseIndex, end)) end++;

        return end;
    }

    // Index of the last set that is not a drop.
    private lastSetIndex(exerciseIndex: number): number {
        let index = this.setsOf(exerciseIndex).length - 1;

        while (index > 0 && this.isDropSet(exerciseIndex, index)) index--;

        return index;
    }

    private createSet(set: Partial<TrainingExerciseSet>, canBeDrop: boolean): FormGroup {
        return this.formBuilder.group({
            reps: [set.reps ?? "", [Validators.maxLength(50)]],
            weight: [set.weight ?? null, [Validators.min(0), Validators.max(9999)]],
            // Typed as min:s, sent as seconds.
            duration: [formatDuration(set.durationSeconds), [Validators.pattern(DURATION_PATTERN)]],
            // The first set of an exercise can't be a drop.
            isDropSet: [canBeDrop && !!set.isDropSet],
        });
    }

    removeExercise(index: number): void {
        // When the first exercise of a superset is removed,
        // the next one starts the superset instead.
        if (!this.isLinked(index) && index + 1 < this.exercises.length && this.isLinked(index + 1))
            this.exercises.at(index + 1).get("isSupersetWithPrevious")?.setValue(false);

        this.exercises.removeAt(index);
    }

    moveExercise(index: number, direction: -1 | 1): void {
        const target = index + direction;

        if (target < 0 || target >= this.exercises.length) return;

        const exercise = this.exercises.at(index);
        this.exercises.removeAt(index);
        this.exercises.insert(target, exercise);

        // The first exercise can't be in a superset with a previous one.
        this.exercises.at(0).get("isSupersetWithPrevious")?.setValue(false);
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

        const save$: Observable<unknown> = this.isTemplate
            ? this.type == ActionType.Create
                ? this.trainingTemplateService.createTemplate(this.toTemplateRequest())
                : this.trainingTemplateService.updateTemplate(this.training.id, this.toTemplateRequest())
            : this.type == ActionType.Create
                ? this.trainingService.createTraining(this.toRequest())
                : this.trainingService.updateTraining(this.training.id, this.toRequest());

        const prefix = this.isTemplate ? "trainingTemplates" : "trainings";

        save$.subscribe({
            next: () => {
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t(this.type == ActionType.Create
                        ? `${prefix}.createdDetail`
                        : `${prefix}.updatedDetail`),
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
        // Training (or template) being edited, or copied when creating.
        const source = this.training ?? null;
        const isUpdate = this.type == ActionType.Update;

        this.form = this.isTemplate
            ? this.formBuilder.group({
                name: [source?.name ?? "", [Validators.required, Validators.maxLength(200)]],
                note: [source?.note ?? "", [Validators.maxLength(2000)]],
                exercises: this.formBuilder.array<FormGroup>([]),
            })
            : this.formBuilder.group({
                client: [source?.client?.id ?? null, [Validators.required]],
                name: [source?.name ?? "", [Validators.required, Validators.maxLength(200)]],
                // A copy is planned for today and not completed yet.
                date: [isUpdate && source ? new Date(source.date) : new Date(), [Validators.required]],
                note: [source?.note ?? "", [Validators.maxLength(2000)]],
                isCompleted: [isUpdate ? source?.isCompleted ?? false : false],
                // A new training notifies the client by default, a change doesn't.
                notifyClient: [!isUpdate],
                exercises: this.formBuilder.array<FormGroup>([]),
            });

        [...(source?.exercises ?? [])]
            .sort((a, b) => a.order - b.order)
            .forEach(exercise => this.addExercise(exercise));
    }

    private toTemplateRequest(): TrainingTemplateRequest {
        const request = this.toRequest();

        return { name: request.name, note: request.note, exercises: request.exercises };
    }

    private toRequest(): TrainingRequest {
        const value = this.form.value;
        const text = (x: string | null | undefined) => x?.trim() ? x.trim() : null;
        const number = (x: number | string | null | undefined) =>
            x === null || x === undefined || x === "" ? null : Number(x);

        return {
            client: value.client,
            name: value.name.trim(),
            date: value.date ? (value.date as Date).toISOString() : "",
            note: text(value.note),
            isCompleted: !!value.isCompleted,
            notifyClient: !!value.notifyClient,
            exercises: (value.exercises ?? []).map((x: any) => ({
                workout: x.workout,
                note: text(x.note),
                isSupersetWithPrevious: !!x.isSupersetWithPrevious,
                // Sets without repetitions, weight and duration are not saved. When a set is left out, its
                // drops join the set before it (or the first one stays, API ignores the flag on it).
                sets: (x.sets ?? [])
                    .map((set: any) => ({
                        reps: text(set.reps),
                        weight: number(set.weight),
                        isDropSet: !!set.isDropSet,
                        durationSeconds: parseDuration(set.duration),
                    }))
                    .filter((set: { reps: string | null; weight: number | null; durationSeconds: number | null }) =>
                        set.reps !== null || set.weight !== null || set.durationSeconds !== null),
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
            this.timedWorkoutIds = new Set(response.filter(x => x.isTimed).map(x => x.id));
        });
    }
}
