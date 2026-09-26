import {Component, effect, ElementRef, OnInit, ViewChild} from "@angular/core";
import {CommonModule} from "@angular/common";
import {Button, ButtonDirective} from "primeng/button";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {Table, TableModule} from "primeng/table";
import {Tag} from "primeng/tag";
import {DialogService} from "primeng/dynamicdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {HelperService} from "../../shared/services/helper.service";
import {DialogFormComponent} from "../../shared/components/dialog-form/dialog-form.component";
import {EntityType} from "../../enums/entity-type";
import {ActionType} from "../../enums/action-type";
import {TranslationService} from "../../i18n/translation.service";
import {TranslatePipe} from "../../i18n/translate.pipe";
import {Workout} from "./models/workout";
import {getTranslation} from "./models/localized-property";
import {WorkoutService} from "./services/workout.service";

@Component({
    selector: "app-workouts",
    imports: [
        CommonModule,
        Button,
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        TableModule,
        Tag,
        TranslatePipe,
    ],
    providers: [DialogService],
    templateUrl: "./workouts.component.html",
    styleUrl: "./workouts.component.scss",
})
export class WorkoutsComponent implements OnInit {
    workouts!: Workout[];

    @ViewChild(`filter`) filter!: ElementRef;

    constructor(
        private workoutService: WorkoutService,
        private dialogService: DialogService,
        private messageService: MessageService,
        private helperService: HelperService,
        private confirmationService: ConfirmationService,
        private translationService: TranslationService,
    ) {
        // Re-translate table values
        // when user changes language.
        effect(() => {
            this.translationService.language();
            this.translateWorkouts();
        });
    }

    ngOnInit(): void {
        this.loadData();
        this.getDataStatus();
    }

    private loadData(): void {
        this.workoutService
            .getWorkouts()
            .subscribe((response: Workout[]) => {
                this.workouts = response.map((x: Workout) =>
                    Object.assign(new Workout(), x),
                );

                this.translateWorkouts();
            });
    }

    private translateWorkouts(): void {
        if (!this.workouts) return;

        const language = this.translationService.language();

        this.workouts.forEach((workout: Workout) => {
            workout.displayName = getTranslation(workout.name, language);
            workout.displayDescription = getTranslation(workout.description, language);
            workout.displayWorkoutTypeList = (workout.workoutTypes ?? [])
                .map(x => getTranslation(x.name, language));
            workout.displayWorkoutTypes = workout.displayWorkoutTypeList.join(", ");
        });

        // New array reference so table re-renders.
        this.workouts = [...this.workouts];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, "contains");
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = "";
    }

    openCreateDialog() {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t("workouts.addNew"),
            data: {
                contentType: EntityType.Workout,
                formType: ActionType.Create,
                dialogId: "createWorkoutForm",
            },
        });

        dialogRef.onClose.subscribe(() => {
            this.loadData();
        });
    }

    openUpdateDialog(workout: Workout) {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t("workouts.updateDataFor") + " " + workout.displayName,
            data: {
                contentType: EntityType.Workout,
                formType: ActionType.Update,
                dialogId: "updateWorkoutForm",
                data: workout,
            },
        });

        dialogRef.onClose.subscribe(() => {
            this.loadData();
        });
    }

    confirmDelete(workout: Workout) {
        this.confirmationService.confirm({
            message: this.translationService.t("workouts.confirmDelete"),
            header: this.translationService.t("common.confirmDeletionHeader") + " " + workout.displayName,
            closable: true,
            closeOnEscape: true,
            icon: "pi pi-exclamation-triangle",
            rejectButtonProps: {
                label: this.translationService.t("common.no"),
                severity: "secondary",
                outlined: true,
            },
            acceptButtonProps: {
                label: this.translationService.t("common.yes"),
            },
            accept: () => {
                this.workoutService
                    .deleteWorkout(workout.id)
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: "success",
                                summary: this.translationService.t("common.success"),
                                detail: this.translationService.t("workouts.deletedDetail"),
                            });

                            this.loadData();
                        },
                        error: () => {
                            this.messageService.add({
                                severity: "error",
                                summary: this.translationService.t("common.error"),
                                detail: this.translationService.t("workouts.deleteErrorDetail"),
                            });
                        },
                    });
            },
        });
    }

    private getDataStatus() {
        this.helperService.getDataStatus().subscribe((response: boolean) => {
            if (response) {
                this.loadData();
            }
        });
    }
}
