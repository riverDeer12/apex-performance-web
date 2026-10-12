import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { Select } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { InputText } from "primeng/inputtext";
import { Button } from "primeng/button";
import { TranslatePipe } from "../../i18n/translate.pipe";
import { TranslationService } from "../../i18n/translation.service";
import { AuditChange, AuditLog, AuditLogsResponse } from "./audit-log";
import { AuditLogService } from "./audit-log.service";

/**
 * Change history for the super admin: who created, changed,
 * deleted or restored what and when, with old and new values.
 */
@Component({
    selector: "app-audit-logs",
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Select, DatePicker, InputText, Button, TranslatePipe],
    templateUrl: "./audit-logs.component.html",
    styleUrl: "./audit-logs.component.scss",
})
export class AuditLogsComponent implements OnInit {
    data: AuditLogsResponse | null = null;

    loading = false;

    page = 1;
    pageSize = 25;

    userId: string | null = null;
    entityType: string | null = null;
    action: string | null = null;
    dateRange: Date[] | null = null;
    search = "";

    readonly actions = ["Created", "Updated", "Deleted", "Restored"];

    constructor(
        private auditLogService: AuditLogService,
        private translationService: TranslationService,
    ) {}

    // The lazy table asks for the first page itself when it is shown.
    ngOnInit(): void {}

    get actionOptions(): { label: string; value: string }[] {
        return this.actions.map(x => ({ label: this.translationService.t("audit.action." + x), value: x }));
    }

    get entityTypeOptions(): { label: string; value: string }[] {
        return (this.data?.entityTypes ?? []).map(x => ({ label: this.entityLabel(x), value: x }));
    }

    onLazyLoad(event: TableLazyLoadEvent): void {
        const rows = event.rows ?? this.pageSize;
        this.pageSize = rows;
        this.page = Math.floor((event.first ?? 0) / rows) + 1;
        this.load();
    }

    applyFilters(): void {
        this.page = 1;
        this.load();
    }

    clearFilters(): void {
        this.userId = null;
        this.entityType = null;
        this.action = null;
        this.dateRange = null;
        this.search = "";
        this.applyFilters();
    }

    // Shows the whole history of one item.
    filterByEntity(log: AuditLog): void {
        this.entityType = log.entityType;
        this.search = log.entityName ?? "";
        this.applyFilters();
    }

    load(): void {
        this.loading = true;

        this.auditLogService.getAuditLogs({
            page: this.page,
            pageSize: this.pageSize,
            userId: this.userId,
            entityType: this.entityType,
            action: this.action,
            from: this.dateRange?.[0] ?? null,
            to: this.dateRange?.[1] ?? this.dateRange?.[0] ?? null,
            search: this.search,
        }).subscribe({
            next: (data) => {
                this.data = data;
                this.loading = false;
            },
            error: () => this.loading = false,
        });
    }

    entityLabel(entityType: string): string {
        const key = "audit.entity." + entityType;
        const label = this.translationService.t(key);
        return label === key ? this.humanize(entityType) : label;
    }

    changePreview(log: AuditLog): AuditChange[] {
        return log.changes.slice(0, 3);
    }

    propertyLabel(property: string): string {
        return this.humanize(property.replace(/Id$/, ""));
    }

    // Dates are shown in local time, other values as they are.
    formatValue(value: string | null): string {
        if (value === null || value === "") return "—";
        if (value === "True") return this.translationService.t("common.yes");
        if (value === "False") return this.translationService.t("common.no");

        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
            const date = new Date(value);
            if (!isNaN(date.getTime()))
                return date.toLocaleString("hr-HR", { dateStyle: "short", timeStyle: "short" });
        }

        return value;
    }

    private humanize(name: string): string {
        return name.replace(/([a-z])([A-Z])/g, "$1 $2");
    }
}
