import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { Select } from "primeng/select";
import { SelectButton } from "primeng/selectbutton";
import { InputText } from "primeng/inputtext";
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { MessageService } from "primeng/api";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { ErrorGroup, LogEntry, LogFile, LogLevelFilter, LogsResponse } from "../../models/log";
import { LogService } from "../../services/log.service";

/**
 * Application logs of one day with errors in focus: summary,
 * errors grouped by cause (most frequent first) and details of an
 * entry with its stack trace and all entries of the same request.
 */
@Component({
    selector: "app-logs",
    imports: [CommonModule, FormsModule, TableModule, Select, SelectButton, InputText, Button, Dialog, TranslatePipe],
    templateUrl: "./logs.component.html",
    styleUrl: "./logs.component.scss",
})
export class LogsComponent implements OnInit {
    data: LogsResponse | null = null;

    loading = false;

    file: string | null = null;

    level: LogLevelFilter = "errors";

    search = "";

    readonly levelOptions = [
        { label: "logs.filter.errors", value: "errors" },
        { label: "logs.filter.warnings", value: "warnings" },
        { label: "logs.filter.requests", value: "requests" },
        { label: "logs.filter.all", value: "all" },
    ];

    detailsVisible = false;
    selected: LogEntry | null = null;
    requestEntries: LogEntry[] = [];
    requestLoading = false;

    constructor(
        private logService: LogService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {}

    ngOnInit(): void {
        this.load();
    }

    get fileOptions(): { label: string; value: string }[] {
        return (this.data?.files ?? []).map(x => ({ label: this.fileLabel(x), value: x.name }));
    }

    load(): void {
        this.loading = true;

        this.logService.getLogs(this.file, this.level, this.search).subscribe({
            next: (data) => {
                this.data = data;
                this.file = data.file;
                this.loading = false;
            },
            error: () => this.loading = false,
        });
    }

    levelSeverity(level: string): string {
        switch (level) {
            case "Fatal":
            case "Error":
                return "error";
            case "Warning":
                return "warning";
            case "Debug":
            case "Verbose":
                return "debug";
            default:
                return "info";
        }
    }

    levelIcon(level: string): string {
        switch (this.levelSeverity(level)) {
            case "error":
                return "pi pi-times-circle";
            case "warning":
                return "pi pi-exclamation-triangle";
            default:
                return "pi pi-info-circle";
        }
    }

    firstLine(text: string | null | undefined): string {
        return (text ?? "").split("\n")[0];
    }

    shortSource(source: string | null | undefined): string {
        return source ? source.split(".").slice(-1)[0] : "";
    }

    openGroup(group: ErrorGroup): void {
        this.openDetails(group.latest);
    }

    // Shows only entries with the same error, without other filters.
    showGroupEntries(group: ErrorGroup): void {
        this.level = "all";
        this.search = group.latest.exception ? this.firstLine(group.latest.exception).slice(0, 80) : group.latest.message.slice(0, 80);
        this.load();
    }

    openDetails(entry: LogEntry): void {
        this.selected = entry;
        this.requestEntries = [];
        this.detailsVisible = true;

        if (!entry.requestId) return;

        this.requestLoading = true;
        this.logService.getRequestLogs(this.file, entry.requestId).subscribe({
            next: (entries) => {
                this.requestEntries = entries;
                this.requestLoading = false;
            },
            error: () => this.requestLoading = false,
        });
    }

    propertyList(entry: LogEntry): { key: string; value: string }[] {
        return Object.entries(entry.properties ?? {}).map(([key, value]) => ({ key, value }));
    }

    copyDetails(entry: LogEntry): void {
        const text = [
            `${entry.timestamp} [${entry.level}] ${entry.message}`,
            entry.requestMethod ? `${entry.requestMethod} ${entry.requestPath} -> ${entry.statusCode}` : "",
            entry.exception ?? "",
            ...this.requestEntries.map(x => `${x.timestamp} [${x.level}] ${x.message}`),
        ].filter(x => !!x).join("\n");

        navigator.clipboard?.writeText(text).then(() =>
            this.messageService.add({
                severity: "success",
                summary: this.translationService.t("common.success"),
                detail: this.translationService.t("logs.copied"),
            }));
    }

    private fileLabel(file: LogFile): string {
        const date = new Date(file.lastModified).toLocaleDateString("hr-HR");
        const size = file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(file.size / 1024)} kB`;

        return `${date} · ${file.name} (${size})`;
    }
}
