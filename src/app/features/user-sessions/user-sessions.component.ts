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

    constructor(
        private userSessionService: UserSessionService,
        private translationService: TranslationService,
    ) {
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
                    return session;
                });
                this.historyLoading = false;
            },
            error: () => {
                this.historyLoading = false;
            },
        });
    }

    get historyHeader(): string {
        const user = this.historyUser;
        const name = user ? (user.fullName ? `${user.fullName} (${user.username})` : user.username) : "";

        return `${this.translationService.t("userSessions.historyFor")} ${name}`;
    }
}
