export class Log {
    timestamp!: Date;
    level!: string;
    traceId!: string;
    spanId!: string;
    exception!: string;
    properties!: LogProperties;
}

export class LogProperties {
    requestMethod!: string;
    requestPath!: string;
    statusCode!: number;
    elapsed!: number;
    sourceContext!: string;
    requestId!: string;
    application!: string;
}
