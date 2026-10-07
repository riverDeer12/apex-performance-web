import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Card } from "primeng/card";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { ClientGoal } from "../../models/client-goal";
import { ClientGoalService } from "../../services/client-goal.service";

/**
 * Logged client's goal and plan written
 * by the coach, shown on the dashboard.
 */
@Component({
    selector: "app-client-goal-card",
    standalone: true,
    imports: [CommonModule, Card, TranslatePipe],
    templateUrl: "./client-goal-card.component.html",
})
export class ClientGoalCardComponent implements OnInit {
    clientGoal: ClientGoal | null = null;

    loaded = false;

    constructor(private clientGoalService: ClientGoalService) {}

    get isEmpty(): boolean {
        const goal = this.clientGoal;
        return !goal || (!goal.goal && !goal.currentBlock && !goal.focus &&
            !goal.nextAssessment && !goal.nextAssessmentDate);
    }

    /**
     * Date is stored as UTC midnight of the picked day.
     */
    get nextAssessmentDate(): Date | null {
        const value = this.clientGoal?.nextAssessmentDate;
        if (!value) return null;
        const date = new Date(value);
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }

    ngOnInit(): void {
        this.clientGoalService.getMyClientGoal().subscribe({
            next: (response: ClientGoal) => {
                this.clientGoal = response;
                this.loaded = true;
            },
            error: (err) => {
                this.loaded = true;
                console.error(err);
            },
        });
    }
}
