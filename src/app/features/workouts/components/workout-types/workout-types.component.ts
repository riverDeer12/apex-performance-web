import { Component, OnInit, effect } from "@angular/core";
import { Observable } from "rxjs";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { Dialog } from "primeng/dialog";
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
 * them. Administrators rename types, deleting a type removes it from
 * all of its workouts.
 */
@Component({
    selector: "app-workout-types",
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Button, InputText, IconField, InputIcon, Dialog, TranslatePipe],
    templateUrl: "./workout-types.component.html",
})
export class WorkoutTypesComponent implements OnInit {
    rows: WorkoutTypeRow[] = [];

    loading = false;

    // Types are shared by all coaches, so only administrators change them.
    canDelete = false;

    editVisible = false;
    // Type being renamed, null when a new type is added.
    editRow: WorkoutTypeRow | null = null;
    editNameHr = "";
    editNameEn = "";
    saving = false;

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

    openCreate(): void {
        this.editRow = null;
        this.editNameHr = "";
        this.editNameEn = "";
        this.editVisible = true;
    }

    openEdit(row: WorkoutTypeRow): void {
        const type = this.loaded.find(x => x.id === row.id);

        this.editRow = row;
        this.editNameHr = getTranslation(type?.name, "hr");
        this.editNameEn = this.exactTranslation(type?.name, "EN");
        this.editVisible = true;
    }

    saveEdit(): void {
        if (!this.editNameHr.trim() || this.saving) return;

        this.saving = true;

        const request = { nameHr: this.editNameHr.trim(), nameEn: this.editNameEn.trim() || null };
        const isNew = !this.editRow;
        const save$: Observable<unknown> = this.editRow
            ? this.workoutService.updateWorkoutType(this.editRow.id, request)
            : this.workoutService.createWorkoutType(request);

        save$.subscribe({
            next: () => {
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t(isNew ? "workoutTypes.createdDetail" : "workoutTypes.updatedDetail"),
                });
                this.saving = false;
                this.editVisible = false;
                this.load();
            },
            error: (error) => {
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("common.error"),
                    detail: getErrorMessage(error),
                });
                this.saving = false;
            },
        });
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

    // Only the translation in that language, without falling back to another one.
    private exactTranslation(name: any, code: string): string {
        const translations: Record<string, string> = typeof name === "string"
            ? (() => { try { return JSON.parse(name) ?? {}; } catch { return {}; } })()
            : name?.translations ?? {};

        return Object.entries(translations).find(([key]) => key.toUpperCase() === code)?.[1] ?? "";
    }

    private toRows(): WorkoutTypeRow[] {
        const language = this.translationService.language();

        return this.loaded
            .map(x => ({ id: x.id, name: getTranslation(x.name, language), workoutsCount: x.workoutsCount ?? 0 }))
            .sort((a, b) => a.name.localeCompare(b.name, language));
    }
}
