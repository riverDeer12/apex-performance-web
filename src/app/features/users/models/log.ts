export interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    exception?: string | null;
    requestMethod?: string | null;
    requestPath?: string | null;
    statusCode?: number | null;
    elapsed?: number | null;
    sourceContext?: string | null;
    requestId?: string | null;
    properties: Record<string, string>;
}

export interface LogFile {
    name: string;
    lastModified: string;
    size: number;
}

export interface ErrorGroup {
    title: string;
    level: string;
    count: number;
    firstSeen: string;
    lastSeen: string;
    paths: string[];
    latest: LogEntry;
}

export interface LogsResponse {
    file: string | null;
    files: LogFile[];
    summary: { total: number; errors: number; warnings: number; requests: number; failedRequests: number };
    errorGroups: ErrorGroup[];
    entries: LogEntry[];
    matchingCount: number;
}

export type LogLevelFilter = "errors" | "warnings" | "requests" | "all";
