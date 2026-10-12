import { Component, OnInit, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { ConfirmationService, MessageService } from "primeng/api";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { Roles } from "../../../../constants/roles";
import { getErrorMessage } from "../../../../constants/error-codes";
import { getTranslation } from "../../models/localized-property";
import { WorkoutService } from "../../services/workout.service";

interface WorkoutTypeRow {
    id: string;
    name: string;
    workoutsCount: number;
}

/**
 * All workout types in the system with the number of workouts that use
 * them. Deleting a type removes it from all of its workouts.
 */
@Component({
    selector: "app-workout-types",
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Button, InputText, IconField, InputIcon, TranslatePipe],
    templateUrl: "./workout-types.component.html",
})
export class WorkoutTypesComponent implements OnInit {
    rows: WorkoutTypeRow[] = [];

    loading = false;

    // Types are shared by all coaches, so only administrators delete them.
    canDelete = false;

    private loaded: { id: string; name: any; workoutsCount?: number }[] = [];

    constructor(
        private workoutService: WorkoutService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private translationService: TranslationService,
        authenticationService: AuthenticationService,
    ) {
        this.canDelete = authenticationService.getUserRole() === Roles.Administrator;

        // Names follow the selected language.
        effect(() => {
            this.translationService.language();
            this.rows = this.toRows();
        });
    }

    ngOnInit(): void {
        this.load();
    }

    confirmDelete(row: WorkoutTypeRow): void {
        const message = row.workoutsCount > 0
            ? this.translationService.t("workoutTypes.confirmDeleteUsed").replace("{count}", String(row.workoutsCount))
            : this.translationService.t("workoutTypes.confirmDelete");

        this.confirmationService.confirm({
            message,
            header: this.translationService.t("common.confirmDeletionHeader") + " " + row.name,
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
                severity: "danger",
            },
            accept: () => {
                this.workoutService.deleteWorkoutType(row.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: "success",
                            summary: this.translationService.t("common.success"),
                            detail: this.translationService.t("workoutTypes.deletedDetail"),
                        });
                        this.load();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: "error",
                            summary: this.translationService.t("common.error"),
                            detail: getErrorMessage(error),
                        });
                    },
                });
            },
        });
    }

    private load(): void {
        this.loading = true;

        this.workoutService.getWorkoutTypes().subscribe({
            next: (types) => {
                this.loaded = types;
                this.rows = this.toRows();
                this.loading = false;
            },
            error: () => this.loading = false,
        });
    }

    private toRows(): WorkoutTypeRow[] {
        const language = this.translationService.language();

        return this.loaded
            .map(x => ({ id: x.id, name: getTranslation(x.name, language), workoutsCount: x.workoutsCount ?? 0 }))
            .sort((a, b) => a.name.localeCompare(b.name, language));
    }
}
