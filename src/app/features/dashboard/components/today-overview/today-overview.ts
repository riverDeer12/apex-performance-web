export interface TodayAppointment {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    clients: string[];
}

export interface OverviewClient {
    id: string;
    fullName: string;
}

export interface LowCreditsClient extends OverviewClient {
    credits: number;
}

export interface InactiveClient extends OverviewClient {
    lastActivityAt: string | null;
}

export interface TodayOverview {
    todayAppointments: TodayAppointment[];
    pendingRequests: { appointments: number; cancelationRequests: number; joinRequests: number };
    lowCreditsClients: LowCreditsClient[];
    inactiveDays: number;
    inactiveClients: InactiveClient[];
    monthlyReviews: { year: number; month: number; dueAt: string; totalClients: number; missingClients: OverviewClient[] };
}
