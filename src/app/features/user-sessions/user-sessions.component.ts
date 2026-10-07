import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {CommonModule, DatePipe} from "@angular/common";
import {Button, ButtonDirective} from "primeng/button";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {Table, TableModule} from "primeng/table";
import {Dialog} from "primeng/dialog";
import {TranslatePipe} from "../../i18n/translate.pipe";
import {TranslationService} from "../../i18n/translation.service";
import {describeUserAgent, UserLastSession, UserSession} from "./models/user-session";
import {UserSessionService} from "./services/user-session.service";
import {Tag} from "primeng/tag";
import {Tooltip} from "primeng/tooltip";
import {ConfirmationService, MessageService} from "primeng/api";
import {AuthenticationService} from "../authentication/services/authentication.service";
import {Roles} from "../../constants/roles";

@Component({
    selector: "app-user-sessions",
    imports: [
        CommonModule,
        Button,
        ButtonDirective,
        DatePipe,
        Dialog,
        IconField,
        InputIcon,
        InputText,
        TableModule,
        Tag,
        Tooltip,
        TranslatePipe,
    ],
    templateUrl: "./user-sessions.component.html",
    styleUrl: "./user-sessions.component.scss",
})
export class UserSessionsComponent implements OnInit {
    userSessions!: UserLastSession[];

    @ViewChild(`filter`) filter!: ElementRef;

    historyVisible = false;
    historyUser: UserLastSession | null = null;
    history: UserSession[] = [];
    historyLoading = false;

    // Only super admin can end sessions of other users.
    canRevoke = false;

    constructor(
        private userSessionService: UserSessionService,
        private translationService: TranslationService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        authenticationService: AuthenticationService,
    ) {
        this.canRevoke = authenticationService.getLoggedUserRoles().includes(Roles.SuperAdmin);
    }

    ngOnInit(): void {
        this.loadData();
    }

    private loadData(): void {
        this.userSessionService.getUserSessions().subscribe((response: UserLastSession[]) => {
            this.userSessions = response.map((x: UserLastSession) => {
                const session = Object.assign(new UserLastSession(), x);
                session.displayRoles = (x.roles ?? []).join(", ");
                session.lastDevice = x.lastUserAgent ? describeUserAgent(x.lastUserAgent, this.translationService.t("userSessions.mobileApp")) : "";
                return session;
            });
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, "contains");
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = "";
    }

    openHistory(userSession: UserLastSession) {
        this.historyUser = userSession;
        this.history = [];
        this.historyVisible = true;
        this.historyLoading = true;

        this.userSessionService.getUserSessionHistory(userSession.userId).subscribe({
            next: (response: UserSession[]) => {
                this.history = response.map((x: UserSession) => {
                    const session = Object.assign(new UserSession(), x);
                    session.device = describeUserAgent(x.userAgent, this.translationService.t("userSessions.mobileApp"));
                    session.statusKey = this.sessionStatusKey(session);
                    return session;
                });
                this.historyLoading = false;
            },
            error: () => {
                this.historyLoading = false;
            },
        });
    }

    private sessionStatusKey(session: UserSession): string {
        if (session.isActive) return "userSessions.status.active";

        switch (session.revokeReason) {
            case "NewLogin":
                return "userSessions.status.newLogin";
            case "Administrator":
                return "userSessions.status.administrator";
            case "Logout":
                return "userSessions.status.logout";
            default:
                return "userSessions.status.expired";
        }
    }

    revokeSession(sessionId: string, user: UserLastSession | null) {
        const name = user ? (user.fullName || user.username) : "";

        this.confirmationService.confirm({
            header: this.translationService.t("userSessions.revokeHeader"),
            message: `${this.translationService.t("userSessions.revokeConfirm")} ${name}?`,
            icon: "pi pi-exclamation-triangle",
            closable: true,
            closeOnEscape: true,
            rejectButtonProps: {
                label: this.translationService.t("common.no"),
                severity: "secondary",
                outlined: true,
            },
            acceptButtonProps: {
                label: this.translationService.t("common.yes"),
                severity: "danger",
            },
            accept: () => {
                this.userSessionService.revokeUserSession(sessionId).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: "success",
                            summary: this.translationService.t("common.success"),
                            detail: this.translationService.t("userSessions.revokedDetail"),
                        });

                        this.loadData();

                        if (this.historyVisible && this.historyUser) {
                            this.openHistory(this.historyUser);
                        }
                    },
                    error: () => {
                        this.messageService.add({
                            severity: "error",
                            summary: this.translationService.t("common.error"),
                            detail: this.translationService.t("userSessions.revokeErrorDetail"),
                        });
                    },
                });
            },
        });
    }

    get historyHeader(): string {
        const user = this.historyUser;
        const name = user ? (user.fullName ? `${user.fullName} (${user.username})` : user.username) : "";

        return `${this.translationService.t("userSessions.historyFor")} ${name}`;
    }
}
