import {Component, Input, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {InputText} from "primeng/inputtext";
import {Button} from "primeng/button";
import {Checkbox} from "primeng/checkbox";
import {MultiSelect} from "primeng/multiselect";
import {Select} from "primeng/select";
import {MessageService} from "primeng/api";
import {ActionType} from "../../../../enums/action-type";
import {RedirectType} from "../../../../enums/redirect-type";
import {ValidationService} from "../../../../shared/services/validation.service";
import {HelperService} from "../../../../shared/services/helper.service";
import {getErrorMessage} from "../../../../constants/error-codes";
import {TranslationService} from "../../../../i18n/translation.service";
import {TranslatePipe} from "../../../../i18n/translate.pipe";
import {MUSCLES, Workout, WorkoutRequest} from "../../models/workout";
import {WorkoutType} from "../../models/workout-type";
import {getTranslation, LocalizedProperty} from "../../models/localized-property";
import {WorkoutService} from "../../services/workout.service";

/**
 * Accepts youtube.com/watch?v=, youtu.be/,
 * youtube.com/shorts/, /embed/ and /live/ links
 * (same formats that API accepts).
 */
const YOUTUBE_URL_PATTERN =
    /^https?:\/\/((www|m)\.)?(youtube\.com\/(watch\?(.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)[\w-]+/i;

// ErrorCodes.AlreadyExists on API.
const DUPLICATE_ERROR_CODE = "1300";

@Component({
    selector: "app-workout-form",
    imports: [CommonModule, InputText, ReactiveFormsModule, Button, Checkbox, MultiSelect, Select, TranslatePipe],
    templateUrl: "./workout-form.component.html",
    styleUrl: "./workout-form.component.scss",
})
export class WorkoutFormComponent implements OnInit {
    @Input() type!: ActionType;
    @Input() workout!: Workout;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    loadingData!: boolean;

    workoutTypes: { id: string; displayName: string }[] = [];

    muscleOptions: { value: string; label: string }[] = [];

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private helperService: HelperService,
        private workoutService: WorkoutService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {
    }

    ngOnInit(): void {
        this.initForm();
        this.loadWorkoutTypes();

        const language = this.translationService.language();
        this.muscleOptions = MUSCLES
            .map(x => ({value: x, label: this.translationService.t("muscles." + x)}))
            .sort((a, b) => a.label.localeCompare(b.label, language));
    }

    /**
     * A muscle is either primary or secondary, so choosing
     * it in one list removes it from the other one.
     */
    onMusclesChange(changed: "muscles" | "secondaryMuscles"): void {
        const other = changed === "muscles" ? "secondaryMuscles" : "muscles";
        const selected: string[] = this.form.get(changed)?.value ?? [];
        const otherValue: string[] = this.form.get(other)?.value ?? [];

        if (otherValue.some(x => selected.includes(x)))
            this.form.get(other)?.setValue(otherValue.filter(x => !selected.includes(x)));
    }

    private loadWorkoutTypes(): void {
        const language = this.translationService.language();

        this.workoutService.getWorkoutTypes().subscribe((response: WorkoutType[]) => {
            this.workoutTypes = response
                .map((x: WorkoutType) => ({
                    id: x.id,
                    displayName: getTranslation(x.name, language),
                }))
                .sort((a, b) => a.displayName.localeCompare(b.displayName));
        });
    }

    submit() {
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

        this.type == ActionType.Create
            ? this.createWorkout()
            : this.updateWorkout();
    }

    // Made once: PrimeNG redraws its options whenever it gets a new array.
    private paceOptionsCache?: { value: string; label: string }[];

    get paceOptions() {
        return this.paceOptionsCache ??= ["", "PerKm", "Per500m", "Kmh"].map(value => ({
            value,
            label: this.translationService.t("workouts.pace" + (value || "None")),
        }));
    }

    private initForm() {
        const workout = this.type == ActionType.Create ? null : this.workout;

        this.form = this.formBuilder.group({
            nameHr: [this.getValue(workout?.name, "HR"), [Validators.required, Validators.maxLength(60)]],
            nameEn: [this.getValue(workout?.name, "EN"), [Validators.maxLength(60)]],
            descriptionHr: [this.getValue(workout?.description, "HR"), [Validators.required]],
            descriptionEn: [this.getValue(workout?.description, "EN")],
            // Optional, video can be added later.
            videoUrl: [workout?.videoUrl ?? "", [Validators.pattern(YOUTUBE_URL_PATTERN)]],
            thumbnailUrl: [workout?.thumbnailUrl ?? ""],
            workoutTypes: [workout?.workoutTypes?.map(x => x.id) ?? []],
            muscles: [workout?.muscles ?? []],
            secondaryMuscles: [workout?.secondaryMuscles ?? []],
            isTimed: [workout?.isTimed ?? false],
            // "" for workouts not done over a distance.
            paceType: [workout?.paceType ?? ""],
        });

        // Pace comes from distance and duration, so these sets record a duration too.
        this.form.get("paceType")!.valueChanges.subscribe(paceType => {
            if (paceType) this.form.get("isTimed")!.setValue(true);
        });
    }

    /**
     * Get exact translation for form field
     * (without fallback to other languages).
     */
    private getValue(property: LocalizedProperty | undefined, code: string): string {
        return property?.translations?.[code] ?? "";
    }

    /**
     * Build localized property from form values.
     * Translations that are not editable in form
     * (e.g. IT) are kept from existing workout.
     */
    private buildLocalizedProperty(existing: LocalizedProperty | undefined,
                                   hr: string, en: string): LocalizedProperty {
        const translations: Record<string, string> = {...(existing?.translations ?? {})};

        translations["HR"] = hr.trim();

        if (en?.trim()) {
            translations["EN"] = en.trim();
        } else {
            delete translations["EN"];
        }

        return {translations};
    }

    private buildRequest(): WorkoutRequest {
        const value = this.form.value;
        const existing = this.type == ActionType.Create ? undefined : this.workout;

        const muscles: string[] = value.muscles ?? [];
        const secondaryMuscles: string[] = value.secondaryMuscles ?? [];
        // A new workout without chosen muscles gets them guessed from
        // its name on API, a change always sends them so they can be cleared.
        const sendMuscles = !!existing || muscles.length > 0 || secondaryMuscles.length > 0;

        return {
            name: this.buildLocalizedProperty(existing?.name, value.nameHr, value.nameEn),
            description: this.buildLocalizedProperty(existing?.description, value.descriptionHr, value.descriptionEn),
            videoUrl: value.videoUrl?.trim() ?? "",
            // Empty thumbnail is generated
            // from YouTube video on API.
            thumbnailUrl: value.thumbnailUrl?.trim() ?? "",
            workoutTypes: value.workoutTypes ?? [],
            ...(sendMuscles ? {muscles, secondaryMuscles} : {}),
            isTimed: !!value.isTimed || !!value.paceType,
            paceType: value.paceType ?? "",
        };
    }

    /**
     * Duplicate workout (same croatian name
     * and description) gets translated message.
     */
    private getWorkoutErrorMessage(error: any): string {
        return error?.error?.errors?.generalErrors?.[0] === DUPLICATE_ERROR_CODE
            ? this.translationService.t("workouts.duplicate")
            : getErrorMessage(error);
    }

    private createWorkout() {
        this.workoutService
            .createWorkout(this.buildRequest())
            .subscribe({
                next: (response: Workout) => {
                    this.workout = Object.assign(new Workout(), response);

                    this.messageService.add({
                        severity: "success",
                        summary: this.translationService.t("common.success"),
                        detail: this.translationService.t("workouts.createdDetail"),
                    });

                    this.helperService.redirectUserAfterSubmit(
                        this.redirectType,
                        this.returnUrl,
                        this.dialogId,
                    );
                },
                error: (error) => {
                    console.error("Error:", error);

                    this.messageService.add({
                        severity: "error",
                        summary: this.translationService.t("workouts.createErrorSummary"),
                        detail: this.getWorkoutErrorMessage(error),
                    });

                    this.loadingData = false;
                },
                complete: () => {
                    this.loadingData = false;
                },
            });
    }

    private updateWorkout() {
        this.workoutService
            .updateWorkout(this.workout.id, this.buildRequest())
            .subscribe({
                next: (response: Workout) => {
                    this.workout = Object.assign(new Workout(), response);

                    this.messageService.add({
                        severity: "success",
                        summary: this.translationService.t("common.success"),
                        detail: this.translationService.t("workouts.updatedDetail"),
                    });

                    this.helperService.redirectUserAfterSubmit(
                        this.redirectType,
                        this.returnUrl,
                        this.dialogId,
                    );
                },
                error: (error) => {
                    console.error("Error:", error);

                    this.messageService.add({
                        severity: "error",
                        summary: this.translationService.t("workouts.updateErrorSummary"),
                        detail: this.getWorkoutErrorMessage(error),
                    });

                    this.loadingData = false;
                },
                complete: () => {
                    this.loadingData = false;
                },
            });
    }
}
