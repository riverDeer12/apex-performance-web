export interface Rules {
    document: string;
    // Version the client has to accept.
    version: string;
    documentUrl: string;
    // Only clients with individual trainings accept these rules.
    isRequired: boolean;
    isAccepted: boolean;
    acceptedVersion: string | null;
    acceptedAt: string | null;
}

export interface AcceptRulesRequest {
    version: string;
    // Parent or guardian accepting for a minor client.
    guardianName: string | null;
    independentTravelApproved: boolean;
}

export interface RulesAcceptance {
    clientId: string;
    clientName: string;
    plan: string;
    isRequired: boolean;
    version: string | null;
    isCurrent: boolean;
    acceptedAt: string | null;
    guardianName: string | null;
    independentTravelApproved: boolean;
}
