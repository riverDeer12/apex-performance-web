import { Component, OnDestroy, OnInit, ViewChild, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Popover } from "primeng/popover";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { Roles } from "../../../../constants/roles";
import { NotificationService } from "../../services/notification.service";
import { AppNotification } from "../../models/notification";

const REFRESH_MS = 60_000;

/**
 * Bell in the top bar with the unread count and the list of notifications.
 * The count is polled while the tab is visible, the list loads when opened.
 */
@Component({
    selector: "app-notifications-bell",
    standalone: true,
    imports: [CommonModule, Popover, TranslatePipe],
    templateUrl: "./notifications-bell.component.html",
    styleUrl: "./notifications-bell.component.scss",
})
export class NotificationsBellComponent implements OnInit, OnDestroy {
    @ViewChild("panel") panel?: Popover;

    notifications = signal<AppNotification[]>([]);
    loading = signal(false);
    loadError = signal(false);

    unreadCount = computed(() => this.notificationService.unreadCount());
    badge = computed(() => (this.unreadCount() > 99 ? "99+" : String(this.unreadCount())));
    hasRead = computed(() => this.notifications().some((x) => x.readAt));

    private isClient = false;
    private timer?: ReturnType<typeof setInterval>;
    private readonly onVisibilityChange = () => {
        if (document.visibilityState === "visible") this.notificationService.refreshUnreadCount();
    };

    constructor(
        private notificationService: NotificationService,
        private authenticationService: AuthenticationService,
        public translationService: TranslationService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.isClient = this.authenticationService.getUserRole() === Roles.Client;

        this.notificationService.refreshUnreadCount();
        // Hidden tabs skip the poll and catch up as soon as they are shown again.
        this.timer = setInterval(() => {
            if (document.visibilityState === "visible") this.notificationService.refreshUnreadCount();
        }, REFRESH_MS);
        document.addEventListener("visibilitychange", this.onVisibilityChange);
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }

    toggle(event: Event): void {
        this.panel?.toggle(event);
    }

    onShow(): void {
        this.load();
        this.notificationService.refreshUnreadCount();
    }

    load(): void {
        this.loading.set(true);
        this.loadError.set(false);
        this.notificationService.getNotifications().subscribe({
            next: (notifications) => {
                this.notifications.set(notifications);
                this.loading.set(false);
            },
            error: () => {
                this.loadError.set(true);
                this.loading.set(false);
            },
        });
    }

    open(notification: AppNotification): void {
        if (!notification.readAt) {
            // Shown as read right away, the request runs in the background.
            this.setRead(notification.id);
            this.notificationService.unreadCount.update((count) => Math.max(count - 1, 0));
            this.notificationService.markRead(notification.id).subscribe({
                error: () => this.notificationService.refreshUnreadCount(),
            });
        }

        const route = this.routeFor(notification);
        if (route) {
            this.panel?.hide();
            this.router.navigateByUrl(route);
        }
    }

    markAllRead(): void {
        this.notificationService.markAllRead().subscribe({
            next: () => {
                const now = new Date().toISOString();
                this.notifications.update((list) => list.map((x) => (x.readAt ? x : { ...x, readAt: now })));
                this.notificationService.unreadCount.set(0);
            },
            error: () => {},
        });
    }

    clearRead(): void {
        this.notificationService.clearRead().subscribe({
            next: () => this.notifications.update((list) => list.filter((x) => !x.readAt)),
            error: () => {},
        });
    }

    // Short relative time for recent ones, the date for older ones.
    formatTime(value: string): string {
        const locale = this.translationService.locale();
        const date = new Date(value);
        const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);

        if (minutes < 1) return this.translationService.t("notifications.justNow");

        const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
        if (minutes < 60) return relative.format(-minutes, "minute");
        if (minutes < 24 * 60) return relative.format(-Math.round(minutes / 60), "hour");
        if (minutes < 7 * 24 * 60) return relative.format(-Math.round(minutes / (24 * 60)), "day");

        return date.toLocaleDateString(locale, { day: "numeric", month: "numeric", year: "numeric" });
    }

    formatFullTime(value: string): string {
        return new Date(value).toLocaleString(this.translationService.locale());
    }

    // Same screens the mobile app opens for each push type, unknown types stay on the page.
    private routeFor(notification: AppNotification): string | null {
        switch (notification.type) {
            case "training":
                return "/admin/trainings";
            case "body_measurement":
                return "/admin/body-measurements";
            // Clients see their goal and monthly reviews on the dashboard.
            case "client_goal":
            case "monthly_review":
                return "/admin/dashboard";
            case "monthly_review_reminder":
                return "/admin/clients";
            // Join and cancelation requests of clients, the data doesn't say which one.
            case "appointment_request":
                return "/admin/appointments/join-requests";
            // Coaches get it when a client requests an appointment that waits for approval.
            case "appointment_updated":
                return this.isClient ? "/admin/dashboard" : "/admin/appointments/appointment-requests";
            default:
                return null;
        }
    }

    private setRead(id: string): void {
        const now = new Date().toISOString();
        this.notifications.update((list) => list.map((x) => (x.id === id ? { ...x, readAt: now } : x)));
    }
}
