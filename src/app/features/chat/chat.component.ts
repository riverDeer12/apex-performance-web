import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { Select } from "primeng/select";
import { Textarea } from "primeng/textarea";
import { ToggleSwitch } from "primeng/toggleswitch";
import { Tooltip } from "primeng/tooltip";
import { MessageService } from "primeng/api";
import { TranslatePipe } from "../../i18n/translate.pipe";
import { TranslationService } from "../../i18n/translation.service";
import { AuthenticationService } from "../authentication/services/authentication.service";
import { ClientService } from "../clients/services/client.service";
import { Roles } from "../../constants/roles";
import { getErrorMessage } from "../../constants/error-codes";
import { ChatService } from "./services/chat.service";
import { ChatConversation, ChatMessage, MessagesReadEvent } from "./models/chat";

const PAGE_SIZE = 50;
const MAX_LENGTH = 4000;

interface ClientOption {
    id: string;
    fullName: string;
}

/**
 * Chat of a coach with their clients. Coaches choose the clients they
 * chat with and can turn a chat off, clients see only enabled chats.
 */
@Component({
    selector: "app-chat",
    standalone: true,
    imports: [CommonModule, FormsModule, Button, Dialog, Select, Textarea, ToggleSwitch, Tooltip, TranslatePipe],
    templateUrl: "./chat.component.html",
    styleUrl: "./chat.component.scss",
})
export class ChatComponent implements OnInit, OnDestroy {
    @ViewChild("messageList") messageList?: ElementRef<HTMLDivElement>;

    readonly maxLength = MAX_LENGTH;

    conversations = signal<ChatConversation[]>([]);
    selectedId = signal<string | null>(null);
    messages = signal<ChatMessage[]>([]);

    selected = computed(() => this.conversations().find((x) => x.id === this.selectedId()) ?? null);

    loadingConversations = false;
    loadingMessages = false;
    loadingOlder = false;
    hasOlder = false;
    sending = false;
    draft = "";

    isCoach = false;
    currentUserId = "";

    newChatVisible = false;
    clientOptions: ClientOption[] = [];
    newChatClientId: string | null = null;

    private subscriptions = new Subscription();

    constructor(
        private chatService: ChatService,
        private clientService: ClientService,
        private authenticationService: AuthenticationService,
        private translationService: TranslationService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.isCoach = this.authenticationService.getUserRole() === Roles.Coach;
        this.currentUserId = this.chatService.currentUserId();

        this.chatService.start();

        this.subscriptions.add(this.chatService.messageReceived$.subscribe((message) => this.onMessage(message)));
        this.subscriptions.add(this.chatService.messagesRead$.subscribe((event) => this.onMessagesRead(event)));
        this.subscriptions.add(this.chatService.conversationUpdated$.subscribe(() => this.loadConversations()));

        this.loadConversations(this.route.snapshot.queryParamMap.get("c"));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    // Name of the other side of the conversation.
    otherName(conversation: ChatConversation): string {
        return this.isCoach ? conversation.client.fullName : conversation.coach.fullName;
    }

    initials(name: string): string {
        return name.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join("");
    }

    isMine(message: ChatMessage): boolean {
        return message.senderUserId === this.currentUserId;
    }

    preview(conversation: ChatConversation): string {
        const message = conversation.lastMessage;
        if (!message) return this.translationService.t("chat.noMessages");

        const content = message.content ?? this.translationService.t("chat.unreadable");
        return this.isMine(message) ? this.translationService.t("chat.you") + ": " + content : content;
    }

    // Time for today's messages, date for older ones.
    formatListTime(value: string | null): string {
        if (!value) return "";

        const date = new Date(value);
        const locale = this.translationService.locale();
        const isToday = date.toDateString() === new Date().toDateString();

        return isToday
            ? date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
            : date.toLocaleDateString(locale, { day: "numeric", month: "numeric" });
    }

    formatTime(value: string): string {
        return new Date(value).toLocaleTimeString(this.translationService.locale(), {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    formatDay(value: string): string {
        return new Date(value).toLocaleDateString(this.translationService.locale(), {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    // Day separator above the first message of each day.
    startsDay(index: number): boolean {
        const list = this.messages();
        if (index === 0) return true;

        return new Date(list[index - 1].createdAt).toDateString() !== new Date(list[index].createdAt).toDateString();
    }

    select(conversation: ChatConversation): void {
        if (this.selectedId() === conversation.id) return;

        this.selectedId.set(conversation.id);
        this.messages.set([]);
        this.draft = "";
        this.hasOlder = false;

        this.router.navigate([], { queryParams: { c: conversation.id }, replaceUrl: true }).then();

        this.loadMessages(conversation.id);
    }

    // Back to the list on small screens.
    closeConversation(): void {
        this.selectedId.set(null);
        this.messages.set([]);
        this.router.navigate([], { queryParams: {}, replaceUrl: true }).then();
    }

    loadOlder(): void {
        const conversationId = this.selectedId();
        const oldest = this.messages()[0];
        if (!conversationId || !oldest || this.loadingOlder) return;

        this.loadingOlder = true;
        const list = this.messageList?.nativeElement;
        const previousHeight = list?.scrollHeight ?? 0;

        this.chatService.getMessages(conversationId, oldest.createdAt, PAGE_SIZE).subscribe({
            next: (messages) => {
                this.loadingOlder = false;
                if (this.selectedId() !== conversationId) return;

                this.hasOlder = messages.length === PAGE_SIZE;
                this.messages.set([...messages, ...this.messages()]);

                // Keeps the message that was on top in place.
                setTimeout(() => {
                    if (list) list.scrollTop = list.scrollHeight - previousHeight;
                });
            },
            error: (err) => {
                this.loadingOlder = false;
                this.showError(err);
            },
        });
    }

    send(): void {
        const conversation = this.selected();
        const content = this.draft.trim();
        if (!conversation || !conversation.isEnabled || !content || this.sending) return;

        this.sending = true;

        this.chatService.sendMessage(conversation.id, content).subscribe({
            next: (message) => {
                this.sending = false;
                this.draft = "";
                this.addMessage(message);
            },
            error: (err) => {
                this.sending = false;
                this.showError(err);
            },
        });
    }

    // Enter sends, Shift+Enter goes to a new line.
    onKeydown(event: KeyboardEvent): void {
        if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            this.send();
        }
    }

    toggleEnabled(conversation: ChatConversation, isEnabled: boolean): void {
        this.chatService.setConversation(conversation.client.id, isEnabled).subscribe({
            next: (updated) => {
                this.updateConversation(conversation.id, { isEnabled: updated.isEnabled });
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t(isEnabled ? "chat.enabledDetail" : "chat.disabledDetail"),
                });
            },
            error: (err) => {
                // Puts the switch back.
                this.updateConversation(conversation.id, { isEnabled: !isEnabled });
                this.showError(err);
            },
        });
    }

    openNewChat(): void {
        this.newChatClientId = null;
        this.newChatVisible = true;

        this.clientService.getClients().subscribe({
            next: (clients) => {
                const enabled = new Set(this.conversations().filter((x) => x.isEnabled).map((x) => x.client.id));

                this.clientOptions = clients
                    .filter((client) => !client.isDeleted && !enabled.has(client.id))
                    .map((client) => ({ id: client.id, fullName: `${client.firstName} ${client.lastName}` }))
                    .sort((a, b) => a.fullName.localeCompare(b.fullName, this.translationService.locale()));
            },
            error: (err) => this.showError(err),
        });
    }

    startChat(): void {
        if (!this.newChatClientId) return;

        this.chatService.setConversation(this.newChatClientId, true).subscribe({
            next: (conversation) => {
                this.newChatVisible = false;

                const existing = this.conversations().find((x) => x.id === conversation.id);
                if (existing) {
                    this.updateConversation(conversation.id, { isEnabled: true });
                } else {
                    this.conversations.set([conversation, ...this.conversations()]);
                }

                this.select(this.conversations().find((x) => x.id === conversation.id)!);
            },
            error: (err) => this.showError(err),
        });
    }

    private loadConversations(selectId?: string | null): void {
        this.loadingConversations = true;

        this.chatService.getConversations().subscribe({
            next: (conversations) => {
                this.loadingConversations = false;
                this.conversations.set(conversations);

                const current = this.selectedId();

                if (selectId && conversations.some((x) => x.id === selectId)) {
                    const conversation = conversations.find((x) => x.id === selectId)!;
                    this.selectedId.set(null);
                    this.select(conversation);
                } else if (current && !conversations.some((x) => x.id === current)) {
                    // Coach turned the chat off for this client.
                    this.closeConversation();
                }
            },
            error: (err) => {
                this.loadingConversations = false;
                this.showError(err);
            },
        });
    }

    private loadMessages(conversationId: string): void {
        this.loadingMessages = true;

        this.chatService.getMessages(conversationId, undefined, PAGE_SIZE).subscribe({
            next: (messages) => {
                this.loadingMessages = false;
                if (this.selectedId() !== conversationId) return;

                this.hasOlder = messages.length === PAGE_SIZE;
                this.messages.set(messages);
                this.scrollToBottom();
                this.markRead(conversationId);
            },
            error: (err) => {
                this.loadingMessages = false;
                this.showError(err);
            },
        });
    }

    private onMessage(message: ChatMessage): void {
        const conversation = this.conversations().find((x) => x.id === message.conversationId);

        if (!conversation) {
            // First message of a chat the coach just turned on.
            this.loadConversations();
            return;
        }

        if (message.conversationId === this.selectedId()) {
            this.addMessage(message);
            if (!this.isMine(message) && document.visibilityState === "visible") this.markRead(message.conversationId);
            return;
        }

        this.updateConversation(message.conversationId, {
            lastMessage: message,
            lastMessageAt: message.createdAt,
            unreadCount: conversation.unreadCount + (this.isMine(message) ? 0 : 1),
        });
        this.sortConversations();
    }

    private onMessagesRead(event: MessagesReadEvent): void {
        if (event.readerUserId === this.currentUserId) {
            this.updateConversation(event.conversationId, { unreadCount: 0 });
            return;
        }

        // The other side read my messages.
        if (event.conversationId === this.selectedId()) {
            this.messages.set(this.messages().map((message) =>
                this.isMine(message) && !message.readAt && message.createdAt <= event.readAt
                    ? { ...message, readAt: event.readAt }
                    : message));
        }
    }

    // The same message comes back from the hub after sending, it's added once.
    private addMessage(message: ChatMessage): void {
        if (message.conversationId === this.selectedId() && !this.messages().some((x) => x.id === message.id)) {
            const list = this.messageList?.nativeElement;
            const atBottom = !list || list.scrollHeight - list.scrollTop - list.clientHeight < 120;

            this.messages.set([...this.messages(), message]);
            if (atBottom || this.isMine(message)) this.scrollToBottom();
        }

        this.updateConversation(message.conversationId, { lastMessage: message, lastMessageAt: message.createdAt });
        this.sortConversations();
    }

    private markRead(conversationId: string): void {
        const conversation = this.conversations().find((x) => x.id === conversationId);
        const hasUnread = this.messages().some((x) => !this.isMine(x) && !x.readAt);
        if (!conversation?.unreadCount && !hasUnread) return;

        this.chatService.markRead(conversationId).subscribe({
            next: () => {
                this.updateConversation(conversationId, { unreadCount: 0 });
                this.chatService.refreshUnreadCount();
            },
            error: () => {},
        });
    }

    private updateConversation(id: string, changes: Partial<ChatConversation>): void {
        this.conversations.set(this.conversations().map((x) => (x.id === id ? { ...x, ...changes } : x)));
    }

    // Latest conversation on top, chats without messages at the end.
    private sortConversations(): void {
        this.conversations.set([...this.conversations()].sort((a, b) =>
            (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? "")));
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            const list = this.messageList?.nativeElement;
            if (list) list.scrollTop = list.scrollHeight;
        });
    }

    private showError(err: any): void {
        console.error(err);
        this.messageService.add({
            severity: "error",
            summary: this.translationService.t("common.error"),
            detail: getErrorMessage(err),
        });
    }
}
