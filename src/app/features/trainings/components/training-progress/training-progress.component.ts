import { Component, computed, effect, OnInit, signal } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ChartModule } from "primeng/chart";
import { Select } from "primeng/select";
import { SelectButton } from "primeng/selectbutton";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { LayoutService } from "../../../../layout/service/layout.service";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { Roles } from "../../../../constants/roles";
import { WorkoutService } from "../../../workouts/services/workout.service";
import { Workout } from "../../../workouts/models/workout";
import { getTranslation } from "../../../workouts/models/localized-property";
import { Training } from "../../models/training";
import { TrainingService } from "../../services/training.service";
import {
    maxWeightPerWorkout,
    muscleGroupOf,
    MUSCLE_GROUPS,
    MuscleGroup,
    percentChange,
    setsPerMuscleGroup,
    strengthIndex,
    toWorkoutPoints,
    workoutsPerWeek,
} from "./training-progress";

type Period = "4w" | "3m" | "6m" | "1y";

// Reference data-viz palette: one hue for single series charts and
// the categorical order for muscle groups, stepped for light and dark.
const PALETTE = {
    light: {
        series: "#2a78d6",
        groups: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"],
        other: "#a3a29c",
    },
    dark: {
        series: "#3987e5",
        groups: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300"],
        other: "#6b6a65",
    },
};

/**
 * Progress of client's completed trainings: strength trend, max weight
 * per exercise, reps, workouts per week and sets per muscle group.
 */
@Component({
    selector: "app-training-progress",
    standalone: true,
    imports: [CommonModule, FormsModule, ChartModule, Select, SelectButton, TranslatePipe, DecimalPipe],
    templateUrl: "./training-progress.component.html",
    styleUrl: "./training-progress.component.scss",
})
export class TrainingProgressComponent implements OnInit {
    readonly trainings = signal<Training[]>([]);
    readonly workouts = signal<Workout[]>([]);
    readonly loaded = signal(false);

    readonly selectedClientId = signal<string | null>(null);
    readonly period = signal<Period>("3m");
    readonly selectedExerciseId = signal<string | null>(null);

    // Clients only see their own progress.
    readonly showClientPicker: boolean;

    // Bumped after theme change is applied, so chart colors follow the theme.
    private readonly themeTick = signal(0);

    readonly periodOptions = computed(() => {
        this.translationService.language();
        return (["4w", "3m", "6m", "1y"] as Period[])
            .map(value => ({ value, label: this.translationService.t("trainingProgress.period." + value) }));
    });

    readonly clients = computed(() => {
        const byId = new Map<string, { id: string; name: string }>();

        for (const training of this.trainings())
            if (training.client?.id && !byId.has(training.client.id))
                byId.set(training.client.id, { id: training.client.id, name: training.client.fullName });

        return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
    });

    private readonly fromDate = computed(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);

        switch (this.period()) {
            case "4w": date.setDate(date.getDate() - 28); break;
            case "3m": date.setMonth(date.getMonth() - 3); break;
            case "6m": date.setMonth(date.getMonth() - 6); break;
            case "1y": date.setFullYear(date.getFullYear() - 1); break;
        }

        return date;
    });

    readonly points = computed(() =>
        toWorkoutPoints(this.trainings(), this.selectedClientId(), this.fromDate()));

    private readonly workoutNames = computed(() => {
        const language = this.translationService.language();
        return new Map(this.workouts().map(x => [x.id, getTranslation(x.name, language)]));
    });

    private readonly muscleGroups = computed(() => new Map<string, MuscleGroup | null>(
        this.workouts().map(workout => [workout.id, muscleGroupOf((workout.workoutTypes ?? [])
            .flatMap(type => [getTranslation(type.name, "en"), getTranslation(type.name, "hr")]))])));

    // Exercises with weight, most often done first.
    readonly exerciseOptions = computed(() => {
        const counts = new Map<string, number>();

        for (const exercise of this.points().flatMap(x => x.exercises))
            if (exercise.sets.some(set => set.weight != null && set.weight > 0))
                counts.set(exercise.workoutId, (counts.get(exercise.workoutId) ?? 0) + 1);

        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => ({ value: id, label: this.workoutNames().get(id) ?? "?" }));
    });

    readonly strength = computed(() => strengthIndex(this.points()));
    readonly strengthChange = computed(() => {
        const values = this.strength();
        return values.length > 1 ? values[values.length - 1].value - 100 : null;
    });

    readonly maxWeight = computed(() => {
        const exerciseId = this.selectedExerciseId();
        return exerciseId ? maxWeightPerWorkout(this.points(), exerciseId) : [];
    });
    readonly maxWeightChange = computed(() => percentChange(this.maxWeight().map(x => x.value)));

    readonly totalReps = computed(() => this.points()
        .filter(x => x.totalReps > 0)
        .map(x => ({ date: x.date, value: x.totalReps })));
    readonly totalRepsChange = computed(() => percentChange(this.totalReps().map(x => x.value)));

    readonly avgReps = computed(() => this.points()
        .filter(x => x.avgRepsPerSet != null)
        .map(x => ({ date: x.date, value: x.avgRepsPerSet! })));

    readonly perWeek = computed(() => workoutsPerWeek(this.points(), this.fromDate(), new Date()));
    readonly avgPerWeek = computed(() => {
        const weeks = this.perWeek();
        return weeks.length ? this.points().length / weeks.length : 0;
    });

    readonly muscleDistribution = computed(() => setsPerMuscleGroup(this.points(), this.muscleGroups()));

    readonly muscleLegend = computed(() => {
        this.translationService.language();
        const { groups, total } = this.muscleDistribution();
        const colors = this.colors();

        return [...MUSCLE_GROUPS.map((group, index) => ({ key: group, color: colors.groups[index] })),
            { key: "other" as const, color: colors.other }]
            .map(item => ({
                ...item,
                label: this.translationService.t("trainingProgress.muscle." + item.key),
                sets: groups[item.key],
                percent: total ? groups[item.key] / total * 100 : 0,
            }))
            .filter(item => item.sets > 0);
    });

    private readonly colors = computed(() => {
        this.themeTick();
        return this.layoutService.isDarkTheme() ? PALETTE.dark : PALETTE.light;
    });

    readonly strengthChart = computed(() => this.lineChart(this.strength(), x => x - 100));
    readonly totalRepsChart = computed(() => this.lineChart(this.totalReps()));
    readonly avgRepsChart = computed(() => this.lineChart(this.avgReps()));
    readonly maxWeightChart = computed(() => this.barChart(this.maxWeight()));
    readonly perWeekChart = computed(() => this.barChart(this.perWeek()));

    readonly muscleChart = computed(() => {
        const legend = this.muscleLegend();
        return {
            labels: legend.map(x => x.label),
            datasets: [{
                data: legend.map(x => x.sets),
                backgroundColor: legend.map(x => x.color),
                // Surface gap between slices.
                borderColor: this.cssVar("--surface-card", "#ffffff"),
                borderWidth: 2,
                hoverOffset: 4,
            }],
        };
    });

    readonly strengthOptions = computed(() => this.lineOptions(value => `${value > 0 ? "+" : ""}${this.round(value)} %`));
    readonly totalRepsOptions = computed(() => this.lineOptions(value => `${this.round(value)}`));
    readonly avgRepsOptions = computed(() => this.lineOptions(value => `${this.round(value, 1)}`));
    readonly maxWeightOptions = computed(() => this.barOptions(value => `${this.round(value, 1)} kg`));
    readonly perWeekOptions = computed(() => this.barOptions(value => `${value}`, 1));

    readonly muscleOptions = computed(() => {
        this.themeTick();
        return {
            maintainAspectRatio: false,
            cutout: "62%",
            plugins: {
                // Legend with values is shown next to the chart.
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (item: any) => {
                            const total = this.muscleDistribution().total;
                            return ` ${item.label}: ${item.parsed} (${this.round(item.parsed / total * 100)} %)`;
                        },
                    },
                },
            },
        };
    });

    constructor(
        private trainingService: TrainingService,
        private workoutService: WorkoutService,
        private translationService: TranslationService,
        private layoutService: LayoutService,
        authenticationService: AuthenticationService,
    ) {
        this.showClientPicker = authenticationService.getUserRole() !== Roles.Client;

        effect(() => {
            this.layoutService.isDarkTheme();
            setTimeout(() => this.themeTick.update(value => value + 1));
        });

        // Default client is the one with the latest completed training.
        effect(() => {
            const clients = this.clients();
            const selected = this.selectedClientId();

            if (selected && clients.some(x => x.id === selected)) return;

            const latest = [...this.trainings()]
                .filter(x => x.isCompleted)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            this.selectedClientId.set(latest?.client?.id ?? clients[0]?.id ?? null);
        });

        // Keep a valid exercise selected for the max weight chart.
        effect(() => {
            const options = this.exerciseOptions();
            const selected = this.selectedExerciseId();

            if (!selected || !options.some(x => x.value === selected))
                this.selectedExerciseId.set(options[0]?.value ?? null);
        });
    }

    ngOnInit(): void {
        this.trainingService.getTrainings().subscribe(trainings => {
            this.trainings.set(trainings);
            this.loaded.set(true);
        });
        this.workoutService.getWorkouts().subscribe(workouts => this.workouts.set(workouts));
    }

    private lineChart(points: { date: Date; value: number }[], map: (value: number) => number = x => x) {
        const color = this.colors().series;

        return {
            labels: points.map(x => this.formatDate(x.date)),
            datasets: [{
                data: points.map(x => map(x.value)),
                borderColor: color,
                backgroundColor: color + "26",
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: color,
                // Surface ring keeps markers readable on the line.
                pointBorderColor: this.cssVar("--surface-card", "#ffffff"),
                pointBorderWidth: 2,
                tension: 0.25,
            }],
        };
    }

    private barChart(points: { date: Date; value: number }[]) {
        const color = this.colors().series;

        return {
            labels: points.map(x => this.formatDate(x.date)),
            datasets: [{
                data: points.map(x => x.value),
                backgroundColor: color,
                borderRadius: { topLeft: 4, topRight: 4 },
                borderSkipped: "bottom",
                maxBarThickness: 28,
            }],
        };
    }

    private lineOptions(format: (value: number) => string) {
        return this.axisOptions(format);
    }

    private barOptions(format: (value: number) => string, stepSize?: number) {
        const options: any = this.axisOptions(format, stepSize);
        options.scales.y.beginAtZero = true;
        return options;
    }

    private axisOptions(format: (value: number) => string, stepSize?: number) {
        this.themeTick();
        this.translationService.language();

        const textColor = this.cssVar("--text-color-secondary", "#64748b");
        const gridColor = this.cssVar("--surface-border", "#e2e8f0");

        return {
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                // Single series, the card title names it.
                legend: { display: false },
                tooltip: {
                    displayColors: false,
                    callbacks: { label: (item: any) => format(item.parsed.y) },
                },
            },
            scales: {
                x: {
                    ticks: { color: textColor, maxTicksLimit: 7, maxRotation: 0 },
                    grid: { display: false },
                    border: { color: gridColor },
                },
                y: {
                    grace: "10%",
                    ticks: { color: textColor, maxTicksLimit: 5, stepSize, callback: (value: number) => format(value) },
                    grid: { color: gridColor },
                    border: { display: false },
                },
            },
        };
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString("hr-HR", { day: "numeric", month: "numeric" });
    }

    private round(value: number, digits = 0): string {
        return value.toLocaleString("hr-HR", { maximumFractionDigits: digits });
    }

    private cssVar(name: string, fallback: string): string {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return value || fallback;
    }
}
