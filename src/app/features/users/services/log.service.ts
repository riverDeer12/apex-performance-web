import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { LogEntry, LogLevelFilter, LogsResponse } from "../models/log";

@Injectable({
    providedIn: "root",
})
export class LogService {
    constructor(private http: HttpClient) {}

    getLogs = (file: string | null, level: LogLevelFilter, search: string) => {
        let params = new HttpParams().set("level", level).set("take", 500);
        if (file) params = params.set("file", file);
        if (search.trim()) params = params.set("search", search.trim());

        return this.http.get<LogsResponse>(environment.apiUrl + "/logs", { params });
    };

    getRequestLogs = (file: string | null, requestId: string) => {
        let params = new HttpParams().set("requestId", requestId);
        if (file) params = params.set("file", file);

        return this.http.get<LogEntry[]>(environment.apiUrl + "/logs/request", { params });
    };
}
