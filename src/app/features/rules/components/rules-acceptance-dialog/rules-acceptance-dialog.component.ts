import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Dialog } from "primeng/dialog";
import { Button } from "primeng/button";
import { Checkbox } from "primeng/checkbox";
import { InputText } from "primeng/inputtext";
import { MessageService } from "primeng/api";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { Roles } from "../../../../constants/roles";
import { getErrorMessage } from "../../../../constants/error-codes";
import { RulesService } from "../../services/rules.service";
import { Rules } from "../../models/rules";

/**
 * Asks a client with individual trainings to accept the current cooperation
 * rules before using the app. It can't be closed, logging out is the other way out.
 */
@Component({
    selector: "app-rules-acceptance-dialog",
    standalone: true,
    imports: [CommonModule, FormsModule, Dialog, Button, Checkbox, InputText, TranslatePipe],
    templateUrl: "./rules-acceptance-dialog.component.html",
})
export class RulesAcceptanceDialogComponent implements OnInit {
    rules: Rules | null = null;
    visible = false;

    accepted = false;
    // Minor client: a parent or guardian accepts, with an optional approval
    // for the client to come and leave alone (14 to 18 years).
    byGuardian = false;
    guardianName = "";
    independentTravelApproved = false;

    saving = false;

    constructor(
        private rulesService: RulesService,
        private authenticationService: AuthenticationService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {}

    get canAccept(): boolean {
        return this.accepted && (!this.byGuardian || !!this.guardianName.trim()) && !this.saving;
    }

    ngOnInit(): void {
        if (this.authenticationService.getUserRole() !== Roles.Client) return;

        this.rulesService.getRules().subscribe({
            next: (rules) => {
                this.rules = rules;
                this.visible = rules.isRequired && !rules.isAccepted;
            },
            // Without the rules the app still works, they are asked for on the next load.
            error: () => {},
        });
    }

    accept(): void {
        if (!this.rules || !this.canAccept) return;

        this.saving = true;

        this.rulesService.acceptRules({
            version: this.rules.version,
            guardianName: this.byGuardian ? this.guardianName.trim() : null,
            independentTravelApproved: this.byGuardian && this.independentTravelApproved,
        }).subscribe({
            next: (rules) => {
                this.saving = false;
                this.rules = rules;
                this.visible = false;
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("rules.acceptedDetail"),
                });
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("common.error"),
                    detail: getErrorMessage(err),
                });
            },
        });
    }

    logOut(): void {
        this.visible = false;
        this.authenticationService.logOut("/authentication/login");
    }
}
