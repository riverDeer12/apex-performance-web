import { Injectable, signal } from "@angular/core";
import { HttpClient, HttpContext } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { SKIP_LOADER } from "../../../interceptors/default.interceptor";
import { AppNotification } from "../models/notification";

// The bell polls and updates in the background, the full page
// loading overlay would flash on every refresh of the count.
const background = () => ({ context: new HttpContext().set(SKIP_LOADER, true) });

/**
 * Notifications of the logged user (the pushes sent to their mobile app),
 * listed under the bell in the top bar.
 */
@Injectable({ providedIn: "root" })
export class NotificationService {
    // Unread notifications, the badge on the bell.
    unreadCount = signal(0);

    constructor(private http: HttpClient) {}

    // The latest 100, newest first.
    getNotifications = () =>
        this.http.get<AppNotification[]>(environment.apiUrl + "/notifications", background());

    markRead = (id: string) =>
        this.http.post(environment.apiUrl + "/notifications/" + id + "/read", {}, background());

    markAllRead = () =>
        this.http.post(environment.apiUrl + "/notifications/read-all", {}, background());

    // Deletes the read notifications.
    clearRead = () =>
        this.http.delete(environment.apiUrl + "/notifications/read", background());

    refreshUnreadCount(): void {
        this.http.get<{ count: number }>(environment.apiUrl + "/notifications/unread-count", background()).subscribe({
            next: (response) => this.unreadCount.set(response.count),
            error: () => {},
        });
    }
}
