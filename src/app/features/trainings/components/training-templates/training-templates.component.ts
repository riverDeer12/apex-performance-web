import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { MultiSelect } from "primeng/multiselect";
import { DatePicker } from "primeng/datepicker";
import { Tooltip } from "primeng/tooltip";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { DialogFormComponent } from "../../../../shared/components/dialog-form/dialog-form.component";
import { HelperService } from "../../../../shared/services/helper.service";
import { EntityType } from "../../../../enums/entity-type";
import { ActionType } from "../../../../enums/action-type";
import { getErrorMessage } from "../../../../constants/error-codes";
import { getTranslation } from "../../../workouts/models/localized-property";
import { ClientService } from "../../../clients/services/client.service";
import { Client } from "../../../clients/models/client";
import { TrainingTemplate } from "../../models/training-template";
import { TrainingTemplateService } from "../../services/training-template.service";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { Roles } from "../../../../constants/roles";

/**
 * Coach's own training templates (administrators see templates
 * of all coaches). A template is assigned to clients as their
 * planned trainings, clients see them only once completed.
 */
@Component({
    selector: "app-training-templates",
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Button, Dialog, MultiSelect, DatePicker, Tooltip,
        TranslatePipe],
    providers: [DialogService],
    templateUrl: "./training-templates.component.html",
})
export class TrainingTemplatesComponent implements OnInit {
    templates: TrainingTemplate[] = [];

    // Administrators see templates of all coaches, so the author is shown.
    isAdministrator = false;

    clients: Client[] = [];

    assignVisible = false;
    assignTemplate: TrainingTemplate | null = null;
    assignClients: string[] = [];
    assignDate: Date = new Date();
    assigning = false;

    constructor(
        private trainingTemplateService: TrainingTemplateService,
        private clientService: ClientService,
        private dialogService: DialogService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private helperService: HelperService,
        private translationService: TranslationService,
        authenticationService: AuthenticationService,
    ) {
        this.isAdministrator = authenticationService.getUserRole() === Roles.Administrator;
    }

    ngOnInit(): void {
        this.loadData();
        this.helperService.getDataStatus().subscribe(() => this.loadData());

        this.clientService.getClients().subscribe((response: Client[]) => {
            this.clients = response.filter(x => !x.isDeleted).map(x => Object.assign(new Client(), x));
        });
    }

    exerciseNames(template: TrainingTemplate): string {
        const language = this.translationService.language();

        return [...template.exercises]
            .sort((a, b) => a.order - b.order)
            .map(x => getTranslation(x.workoutName, language))
            .join(", ");
    }

    openCreateDialog(): void {
        this.openFormDialog(ActionType.Create, "trainingTemplates.addNew", null);
    }

    openUpdateDialog(template: TrainingTemplate): void {
        this.openFormDialog(ActionType.Update, "trainingTemplates.edit", template);
    }

    openAssignDialog(template: TrainingTemplate): void {
        this.assignTemplate = template;
        this.assignClients = [];
        this.assignDate = new Date();
        this.assignVisible = true;
    }

    assign(): void {
        if (!this.assignTemplate || !this.assignClients.length || !this.assignDate || this.assigning) return;

        this.assigning = true;

        this.trainingTemplateService
            .assignTemplate(this.assignTemplate.id, this.assignClients, this.assignDate.toISOString())
            .subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: "success",
                        summary: this.translationService.t("common.success"),
                        detail: this.translationService.t("trainingTemplates.assignedDetail")
                            .replace("{count}", String(response.trainingIds.length)),
                    });
                    this.assigning = false;
                    this.assignVisible = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: "error",
                        summary: this.translationService.t("trainingTemplates.assignErrorSummary"),
                        detail: getErrorMessage(error),
                    });
                    this.assigning = false;
                },
            });
    }

    confirmDelete(template: TrainingTemplate): void {
        this.confirmationService.confirm({
            message: this.translationService.t("trainingTemplates.deleteConfirm"),
            header: this.translationService.t("common.confirmDeletionHeader") + " " + template.name,
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
                this.trainingTemplateService.deleteTemplate(template.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: "success",
                            summary: this.translationService.t("common.success"),
                            detail: this.translationService.t("trainingTemplates.deletedDetail"),
                        });
                        this.loadData();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: "error",
                            summary: this.translationService.t("trainingTemplates.saveErrorSummary"),
                            detail: getErrorMessage(error),
                        });
                    },
                });
            },
        });
    }

    private openFormDialog(formType: ActionType, headerKey: string, template: TrainingTemplate | null): void {
        const dialogRef = this.dialogService.open(DialogFormComponent, {
            header: this.translationService.t(headerKey),
            data: {
                contentType: EntityType.TrainingTemplate,
                formType,
                dialogId: formType === ActionType.Create ? "createTrainingTemplateForm" : "updateTrainingTemplateForm",
                data: template,
            },
        });

        dialogRef.onClose.subscribe(() => this.loadData());
    }

    private loadData(): void {
        this.trainingTemplateService.getTemplates().subscribe((response: TrainingTemplate[]) => {
            this.templates = response.map(x => Object.assign(new TrainingTemplate(), x));
        });
    }
}
