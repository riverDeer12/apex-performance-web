export class UserLastSession {
    userId!: string;
    username!: string;
    fullName?: string | null;
    email!: string;
    roles!: string[];
    lastLoginAt?: string | null;
    lastIpAddress?: string | null;
    lastUserAgent?: string | null;
    loginsCount!: number;

    // Values prepared for table display and filtering.
    displayRoles!: string;
    lastDevice!: string;
}

export class UserSession {
    id!: string;
    loggedInAt!: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    rememberMe!: boolean;

    device!: string;
}

/**
 * Short, readable description of the device
 * from User-Agent header (e.g. "Chrome · Windows").
 */
export function describeUserAgent(userAgent: string | null | undefined,
                                  mobileAppLabel = "Mobile app"): string {
    if (!userAgent) return "-";

    const ua = userAgent.toLowerCase();

    const os =
        /iphone|ipad|ipod/.test(ua) ? "iOS" :
        ua.includes("android") ? "Android" :
        ua.includes("windows") ? "Windows" :
        ua.includes("mac os") ? "macOS" :
        ua.includes("linux") ? "Linux" : null;

    const client =
        ua.includes("dart") || ua.includes("okhttp") || ua.includes("cfnetwork") ? mobileAppLabel :
        ua.includes("edg/") ? "Edge" :
        ua.includes("opr/") || ua.includes("opera") ? "Opera" :
        ua.includes("firefox") || ua.includes("fxios") ? "Firefox" :
        ua.includes("chrome") || ua.includes("crios") ? "Chrome" :
        ua.includes("safari") ? "Safari" : null;

    const parts = [client, os].filter(x => !!x);

    return parts.length > 0 ? parts.join(" · ") : userAgent;
}
