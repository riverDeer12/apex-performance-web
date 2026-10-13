import { Injectable, signal } from "@angular/core";
import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { Subject } from "rxjs";
import { jwtDecode } from "jwt-decode";
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { environment } from "../../../../environments/environment";
import { ChatConversation, ChatMessage, MessagesReadEvent } from "../models/chat";
import { SKIP_LOADER } from "../../../interceptors/default.interceptor";

// Chat has its own loading indicators and updates in the background,
// the full page loading overlay would flash on every incoming message.
const background = () => ({ context: new HttpContext().set(SKIP_LOADER, true) });

/**
 * Chat between a coach and a client. Messages are sent and loaded through
 * the REST API, the SignalR hub only pushes events to the open pages.
 */
@Injectable({ providedIn: "root" })
export class ChatService {
    // Unread messages in all conversations of the logged user, shown in the menu.
    unreadCount = signal(0);

    readonly messageReceived$ = new Subject<ChatMessage>();
    readonly messagesRead$ = new Subject<MessagesReadEvent>();
    readonly conversationUpdated$ = new Subject<string>();

    private connection?: HubConnection;

    constructor(private http: HttpClient) {}

    getConversations = () =>
        this.http.get<ChatConversation[]>(environment.apiUrl + "/chat/conversations", background());

    // Coaches turn the chat with a client on or off.
    setConversation = (clientId: string, isEnabled: boolean) =>
        this.http.post<ChatConversation>(environment.apiUrl + "/chat/conversations", { clientId, isEnabled }, background());

    // Newest messages before the given time, returned oldest first.
    getMessages = (conversationId: string, before?: string, take = 50) => {
        let params = new HttpParams().set("take", take);
        if (before) params = params.set("before", before);

        return this.http.get<ChatMessage[]>(
            environment.apiUrl + "/chat/conversations/" + conversationId + "/messages", { params, ...background() });
    };

    sendMessage = (conversationId: string, content: string) =>
        this.http.post<ChatMessage>(
            environment.apiUrl + "/chat/conversations/" + conversationId + "/messages", { content }, background());

    markRead = (conversationId: string) =>
        this.http.post(environment.apiUrl + "/chat/conversations/" + conversationId + "/read", {}, background());

    refreshUnreadCount(): void {
        this.http.get<{ count: number }>(environment.apiUrl + "/chat/unread-count", background()).subscribe({
            next: (response) => this.unreadCount.set(response.count),
            error: () => {},
        });
    }

    // User id from the "sub" claim of the login token, the hub and messages use it.
    currentUserId(): string {
        const token = localStorage.getItem("token");
        if (!token) return "";

        try {
            return (jwtDecode(token) as { sub?: string }).sub ?? "";
        } catch {
            return "";
        }
    }

    /**
     * Connects to the hub once per login, later calls do nothing. The token
     * goes in the query string since browsers can't set headers on WebSockets.
     */
    start(): void {
        if (this.connection) return;

        this.connection = new HubConnectionBuilder()
            .withUrl(environment.apiUrl + "/hubs/chat", {
                accessTokenFactory: () => localStorage.getItem("token") ?? "",
                // API allows any origin without cookies, the token is enough.
                withCredentials: false,
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Warning)
            .build();

        this.connection.on("MessageReceived", (message: ChatMessage) => {
            this.messageReceived$.next(message);
            if (message.senderUserId !== this.currentUserId()) this.refreshUnreadCount();
        });

        this.connection.on("MessagesRead", (event: MessagesReadEvent) => {
            this.messagesRead$.next(event);
            if (event.readerUserId === this.currentUserId()) this.refreshUnreadCount();
        });

        this.connection.on("ConversationUpdated", (conversationId: string) => {
            this.conversationUpdated$.next(conversationId);
            this.refreshUnreadCount();
        });

        // Events missed while offline are picked up from the API.
        this.connection.onreconnected(() => this.refreshUnreadCount());

        this.connection.start().catch((err) => console.error(err));
        this.refreshUnreadCount();
    }

    stop(): void {
        if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
            this.connection.stop().catch(() => {});
        }

        this.connection = undefined;
        this.unreadCount.set(0);
    }
}
