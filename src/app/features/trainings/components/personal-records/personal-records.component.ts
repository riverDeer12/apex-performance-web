import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { Select } from "primeng/select";
import { Tag } from "primeng/tag";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { Roles } from "../../../../constants/roles";
import { getTranslation } from "../../../workouts/models/localized-property";
import { ClientService } from "../../../clients/services/client.service";
import { Client } from "../../../clients/models/client";
import { PersonalRecord } from "../../models/personal-record";
import { PersonalRecordService } from "../../services/personal-record.service";

export interface ExerciseRecords {
    workoutId: string;
    name: string;
    maxWeight: PersonalRecord | null;
    oneRepMax: PersonalRecord | null;
    lastAchievedAt: string;
    isRecent: boolean;
    // All records of the exercise, newest first.
    history: PersonalRecord[];
}

// Records set in this many days are marked as new.
const RECENT_DAYS = 14;

/**
 * Personal records of a client per exercise, calculated by the API
 * from completed trainings. Coaches and administrators choose the client,
 * a client (later in their part of the app) sees their own records.
 */
@Component({
    selector: "app-personal-records",
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Button, Select, Tag, TranslatePipe],
    templateUrl: "./personal-records.component.html",
})
export class PersonalRecordsComponent implements OnInit {
    isClient = false;

    clients: Client[] = [];

    selectedClient: string | null = null;

    exercises: ExerciseRecords[] = [];

    loading = false;

    constructor(
        private personalRecordService: PersonalRecordService,
        private clientService: ClientService,
        private translationService: TranslationService,
        authenticationService: AuthenticationService,
    ) {
        this.isClient = authenticationService.getUserRole() === Roles.Client;
    }

    ngOnInit(): void {
        if (this.isClient) {
            this.loadRecords();
            return;
        }

        this.clientService.getClients().subscribe((response: Client[]) => {
            this.clients = response.filter(x => !x.isDeleted).map(x => Object.assign(new Client(), x));
        });
    }

    loadRecords(): void {
        if (!this.isClient && !this.selectedClient) {
            this.exercises = [];
            return;
        }

        this.loading = true;

        this.personalRecordService.getPersonalRecords(this.selectedClient ?? undefined).subscribe({
            next: (records) => {
                this.exercises = this.groupByExercise(records);
                this.loading = false;
            },
            error: () => {
                this.exercises = [];
                this.loading = false;
            },
        });
    }

    typeLabel(record: PersonalRecord): string {
        return this.translationService.t(record.type === "MaxWeight"
            ? "personalRecords.maxWeight"
            : "personalRecords.oneRepMax");
    }

    private groupByExercise(records: PersonalRecord[]): ExerciseRecords[] {
        const language = this.translationService.language();
        const recentFrom = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
        const byWorkout = new Map<string, PersonalRecord[]>();

        [...records]
            .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
            .forEach(record => byWorkout.set(record.workoutId, [...(byWorkout.get(record.workoutId) ?? []), record]));

        return [...byWorkout.entries()]
            .map(([workoutId, history]) => ({
                workoutId,
                name: getTranslation(history[0].workoutName, language),
                // History is newest first, so the first record of a type is the current one.
                maxWeight: history.find(x => x.type === "MaxWeight") ?? null,
                oneRepMax: history.find(x => x.type === "EstimatedOneRepMax") ?? null,
                lastAchievedAt: history[0].achievedAt,
                isRecent: new Date(history[0].achievedAt).getTime() >= recentFrom,
                history,
            }))
            .sort((a, b) => new Date(b.lastAchievedAt).getTime() - new Date(a.lastAchievedAt).getTime());
    }
}
