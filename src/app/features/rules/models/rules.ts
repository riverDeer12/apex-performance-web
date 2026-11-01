export interface Rules {
    document: string;
    // Version the client has to accept.
    version: string;
    // PDF of the rules in Croatian, the binding version.
    documentUrl: string;
    // PDF by language ("hr", "en", "it", "de"); missing on an older API.
    documentUrls?: Record<string, string>;
    // Only clients with individual trainings accept these rules.
    isRequired: boolean;
    isAccepted: boolean;
    acceptedVersion: string | null;
    acceptedAt: string | null;
}

/** PDF of the rules in the given language, the Croatian one when there's no translation. */
export function rulesDocumentUrl(rules: Rules, language: string): string {
    return rules.documentUrls?.[language] ?? rules.documentUrl;
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
