// Push notification types (PushNotificationTypes in the API), each opens its own page.
export type NotificationType =
    | "appointment_request"
    | "appointment_updated"
    | "body_measurement"
    | "client_goal"
    | "monthly_review"
    | "monthly_review_reminder"
    | "training";

/**
 * A push notification kept for the logged user, shown in the list under the bell.
 * Only users with a registered mobile device get them.
 */
export interface AppNotification {
    id: string;
    // NotificationType, or a newer type this version doesn't know yet.
    type: string;
    title: string;
    body: string;
    // Same data as the push, the type and ids like trainingId.
    data: Record<string, string>;
    createdAt: string;
    readAt: string | null;
}
