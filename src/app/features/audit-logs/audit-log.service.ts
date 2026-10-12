import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { AuditLogsQuery, AuditLogsResponse } from "./audit-log";

@Injectable({
    providedIn: "root",
})
export class AuditLogService {
    constructor(private http: HttpClient) {}

    getAuditLogs = (query: AuditLogsQuery) => {
        let params = new HttpParams().set("page", query.page).set("pageSize", query.pageSize);

        if (query.userId) params = params.set("userId", query.userId);
        if (query.entityType) params = params.set("entityType", query.entityType);
        if (query.action) params = params.set("action", query.action);
        if (query.from) params = params.set("from", query.from.toISOString());
        // The whole last selected day is included.
        if (query.to) params = params.set("to", new Date(query.to.getTime() + 24 * 60 * 60 * 1000).toISOString());
        if (query.search?.trim()) params = params.set("search", query.search.trim());

        return this.http.get<AuditLogsResponse>(environment.apiUrl + "/audit-logs", { params });
    };
}
