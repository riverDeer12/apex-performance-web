export interface AuditChange {
    property: string;
    oldValue: string | null;
    newValue: string | null;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string | null;
    userName: string | null;
    action: "Created" | "Updated" | "Deleted" | "Restored";
    entityType: string;
    entityId: string;
    entityName: string | null;
    changes: AuditChange[];
}

export interface AuditLogsResponse {
    items: AuditLog[];
    total: number;
    entityTypes: string[];
    users: { id: string; name: string }[];
}

export interface AuditLogsQuery {
    page: number;
    pageSize: number;
    userId?: string | null;
    entityType?: string | null;
    action?: string | null;
    from?: Date | null;
    to?: Date | null;
    search?: string;
}
