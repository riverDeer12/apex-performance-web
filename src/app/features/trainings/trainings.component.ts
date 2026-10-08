import { Tooltip } from "primeng/tooltip";
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { Checkbox } from "primeng/checkbox";
import { Tag } from "primeng/tag";
import { Select } from "primeng/select";
import { DialogService } from "primeng/dynamicdialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { AuthenticationService } from "../authentication/services/authentication.service";
import { Roles } from "../../constants/roles";
import { HelperService } from "../../shared/services/helper.service";
import { DialogFormComponent } from "../../shared/components/dialog-form/dialog-form.component";
import { EntityType } from "../../enums/entity-type";
import { ActionType } from "../../enums/action-type";
import { getErrorMessage } from "../../constants/error-codes";
import { TranslationService } from "../../i18n/translation.service";
import { TranslatePipe } from "../../i18n/translate.pipe";
import { Training } from "./models/training";
import { TrainingService } from "./services/training.service";
import { TrainingDetailsComponent } from "./components/training-details/training-details.component";

@Component({
    selector: "app-trainings",
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Button, Checkbox, Tag, Select, Tooltip, TranslatePipe],
    providers: [DialogService],
    templateUrl: "./trainings.component.html",
})
export class TrainingsComponent implements OnInit {
    trainings!: Training[];

    // Coaches and administrators manage trainings, clients only view them.
    canManageTrainings: boolean;

    isClient: boolean;

    selectedCompletion: boolean | null = null;

    constructor(
        private trainingService: TrainingService,
        private dialogService: DialogService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private helperService: HelperService,
        private translationService: TranslationService,
        authenticationService: AuthenticationService,
    ) {
        const role = authenticationService.getUserRole();
        this.canManageTrainings = role === Roles.Administrator || role === Roles.Coach;
        this.isClient = role === Roles.Client;
    }

    get completionOptions(): { label: string; value: boolean }[] {
        return [
            { label: this.translationService.t("trainings.completed"), value: true },
            { label: this.translationService.t("trainings.notCompleted"), value: false },
        ];
    }

    ngOnInit(): void {
        this.loadData();
        this.helperService.getDataStatus().subscribe(() => this.loadData());
    }

    openCreateDialog(): void {
        this.openFormDialog(ActionType.Create, "trainings.addNew", null);
    }

    openUpdateDialog(training: Training): void {
        this.openFormDialog(ActionType.Update, "trainings.edit", training);
    }

    // New training with the same client, exercises and sets, planned for today.
    openCopyDialog(training: Training): void {
        this.openFormDialog(ActionType.Create, "trainings.copy", training);
    }

    openSaveAsTemplateDialog(training: Training): void {
        this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t("trainingTemplates.saveAsTemplate"),
            data: {
                contentType: EntityType.TrainingTemplate,
                formType: ActionType.Create,
                dialogId: "createTrainingTemplateForm",
                data: training,
            },
        });
    }

    openDetailsDialog(training: Training): void {
        this.dialogService.open(TrainingDetailsComponent, {
            header: training.name,
            modal: true,
            dismissableMask: true,
            closable: true,
            width: "60rem",
            breakpoints: { "960px": "95vw" },
            data: { training },
        });
    }

    toggleCompleted(training: Training, isCompleted: boolean): void {
        this.trainingService.changeCompletion(training.id, isCompleted).subscribe({
            next: (response) => {
                training.isCompleted = response.isCompleted;
                training.completedAt = response.completedAt;
            },
            error: (error) => {
                training.isCompleted = !isCompleted;
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("trainings.saveErrorSummary"),
                    detail: getErrorMessage(error),
                });
            },
        });
    }

    confirmDelete(training: Training): void {
        this.confirmationService.confirm({
            message: this.translationService.t("trainings.deleteConfirm"),
            header: this.translationService.t("common.confirmDeletionHeader") + " " + training.name,
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
                this.trainingService.deleteTraining(training.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: "success",
                            summary: this.translationService.t("common.success"),
                            detail: this.translationService.t("trainings.deletedDetail"),
                        });
                        this.loadData();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: "error",
                            summary: this.translationService.t("trainings.saveErrorSummary"),
                            detail: getErrorMessage(error),
                        });
                    },
                });
            },
        });
    }

    private openFormDialog(formType: ActionType, headerKey: string, training: Training | null): void {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t(headerKey),
            data: {
                contentType: EntityType.Training,
                formType,
                dialogId: formType === ActionType.Create ? "createTrainingForm" : "updateTrainingForm",
                data: training,
            },
        });

        dialogRef.onClose.subscribe(() => this.loadData());
    }

    private loadData(): void {
        this.trainingService.getTrainings().subscribe((response: Training[]) => {
            this.trainings = response.map(x => Object.assign(new Training(), x));
        });
    }
}
