import {Component, computed, effect, input, signal} from "@angular/core";
import {CommonModule, DatePipe, DecimalPipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ChartModule} from "primeng/chart";
import {Select} from "primeng/select";
import {TranslatePipe} from "../../../../i18n/translate.pipe";
import {TranslationService} from "../../../../i18n/translation.service";
import {LayoutService} from "../../../../layout/service/layout.service";
import {BodyMeasurement} from "../../models/body-measurement";

interface ClientOption {
    id: string;
    name: string;
}

/**
 * Line chart of one client's weight over time,
 * with latest weight and change since first measurement.
 */
@Component({
    selector: "app-weight-progress-chart",
    imports: [CommonModule, FormsModule, ChartModule, Select, TranslatePipe, DatePipe, DecimalPipe],
    templateUrl: "./weight-progress-chart.component.html",
    styleUrl: "./weight-progress-chart.component.scss",
})
export class WeightProgressChartComponent {
    readonly measurements = input<BodyMeasurement[]>([]);

    // Client picker is hidden for clients, they only see their own data.
    readonly showClientPicker = input<boolean>(true);

    readonly selectedClientId = signal<string | null>(null);

    // Bumped after theme change is applied to the page,
    // so chart colors are read from the new theme.
    private readonly themeTick = signal(0);

    readonly clients = computed<ClientOption[]>(() => {
        const byId = new Map<string, ClientOption>();

        for (const measurement of this.measurements() ?? []) {
            const client = measurement.client;
            if (client?.id && !byId.has(client.id))
                byId.set(client.id, {id: client.id, name: `${client.firstName} ${client.lastName}`});
        }

        return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
    });

    readonly points = computed(() => {
        const clientId = this.selectedClientId();

        return (this.measurements() ?? [])
            .filter(x => x.client?.id === clientId && x.weight != null)
            .map(x => ({date: new Date(x.createdAt), weight: Number(x.weight)}))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    readonly latest = computed(() => this.points().at(-1) ?? null);

    readonly change = computed(() => {
        const points = this.points();
        return points.length > 1 ? points[points.length - 1].weight - points[0].weight : null;
    });

    readonly chartData = computed(() => {
        this.themeTick();
        const color = this.cssVar("--p-primary-color", "#1d4ed8");

        return {
            datasets: [{
                label: this.translationService.t("bodyMeasurements.weight"),
                data: this.points().map(x => ({x: x.date.getTime(), y: x.weight})),
                borderColor: color,
                backgroundColor: color,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                // Surface ring keeps markers readable where the line overlaps them.
                pointBorderColor: this.cssVar("--surface-card", "#ffffff"),
                pointBorderWidth: 2,
                tension: 0.25,
            }],
        };
    });

    readonly chartOptions = computed(() => {
        this.themeTick();
        this.translationService.language();

        const textColor = this.cssVar("--text-color-secondary", "#64748b");
        const gridColor = this.cssVar("--surface-border", "#e2e8f0");
        const formatDate = (value: number) =>
            new Date(value).toLocaleDateString("hr-HR", {day: "2-digit", month: "2-digit", year: "2-digit"});

        return {
            maintainAspectRatio: false,
            interaction: {mode: "nearest", axis: "x", intersect: false},
            plugins: {
                // Single series, the card title names it.
                legend: {display: false},
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        title: (items: any[]) => items.length ? formatDate(items[0].parsed.x) : "",
                        label: (item: any) => `${item.parsed.y.toLocaleString("hr-HR")} kg`,
                    },
                },
            },
            scales: {
                // Linear time scale so gaps between measurements are proportional.
                x: {
                    type: "linear",
                    ticks: {color: textColor, maxTicksLimit: 6, callback: (value: number) => formatDate(value)},
                    grid: {display: false},
                    border: {color: gridColor},
                },
                y: {
                    grace: "10%",
                    ticks: {color: textColor, callback: (value: number) => `${value} kg`},
                    grid: {color: gridColor},
                    border: {display: false},
                },
            },
        };
    });

    constructor(
        private translationService: TranslationService,
        private layoutService: LayoutService,
    ) {
        effect(() => {
            this.layoutService.isDarkTheme();
            setTimeout(() => this.themeTick.update(value => value + 1));
        });

        // Select a client by default (the one measured most recently)
        // and keep selection valid when measurements change.
        effect(() => {
            const clients = this.clients();
            const selected = this.selectedClientId();

            if (selected && clients.some(x => x.id === selected)) return;

            const latest = [...(this.measurements() ?? [])]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

            this.selectedClientId.set(latest?.client?.id ?? clients[0]?.id ?? null);
        });
    }

    private cssVar(name: string, fallback: string): string {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return value || fallback;
    }
}
