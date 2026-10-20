import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { Menu } from "primeng/menu";
import { Select } from "primeng/select";
import { Textarea } from "primeng/textarea";
import { ToggleSwitch } from "primeng/toggleswitch";
import { Tooltip } from "primeng/tooltip";
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { TranslatePipe } from "../../i18n/translate.pipe";
import { TranslationService } from "../../i18n/translation.service";
import { AuthenticationService } from "../authentication/services/authentication.service";
import { Roles } from "../../constants/roles";
import { getErrorMessage } from "../../constants/error-codes";
import { ChatService } from "./services/chat.service";
import { ChatConversation, ChatMessage, ChatWorkout, MessagesReadEvent } from "./models/chat";
import { WorkoutService } from "../workouts/services/workout.service";
import { getTranslation } from "../workouts/models/localized-property";

const PAGE_SIZE = 50;
const MAX_LENGTH = 4000;
const MAX_REASON_LENGTH = 1000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
// Photos are shrunk before sending, full size isn't needed in a chat.
const MAX_IMAGE_SIDE = 1600;
const IMAGE_QUALITY = 0.85;
// Widest picture in a bubble, in pixels.
const IMAGE_BUBBLE_WIDTH = 280;

interface PreparedImage {
    blob: Blob;
    fileName: string;
    width: number | null;
    height: number | null;
}

interface WorkoutOption {
    id: string;
    name: string;
}

interface ContactOption {
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
    imports: [CommonModule, FormsModule, Button, Dialog, Menu, Select, Textarea, ToggleSwitch, Tooltip, TranslatePipe],
    templateUrl: "./chat.component.html",
    styleUrl: "./chat.component.scss",
})
export class ChatComponent implements OnInit, OnDestroy {
    @ViewChild("messageList") messageList?: ElementRef<HTMLDivElement>;
    @ViewChild("imageInput") imageInput?: ElementRef<HTMLInputElement>;
    @ViewChild("menu") menu?: Menu;

    readonly maxLength = MAX_LENGTH;
    readonly maxReasonLength = MAX_REASON_LENGTH;

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
    contactOptions: ContactOption[] = [];
    newChatContactId: string | null = null;

    sendingImage = false;
    // Picture opened large.
    previewUrl: string | null = null;

    menuItems: MenuItem[] = [];

    workoutVisible = false;
    workoutOptions: WorkoutOption[] = [];
    loadingWorkouts = false;
    workoutId: string | null = null;
    workoutNote = "";
    sendingWorkout = false;

    reportVisible = false;
    reportReason = "";
    reporting = false;

    private subscriptions = new Subscription();

    constructor(
        private chatService: ChatService,
        private authenticationService: AuthenticationService,
        private translationService: TranslationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private workoutService: WorkoutService,
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

        const content = this.previewContent(message);
        return this.isMine(message) ? this.translationService.t("chat.you") + ": " + content : content;
    }

    // Pictures and workouts get a label, their caption or note isn't the whole message.
    private previewContent(message: ChatMessage): string {
        if (message.type === "image") {
            const label = this.translationService.t("chat.previewImage");
            return message.content ? label + " · " + message.content : label;
        }

        if (message.type === "workout") {
            return message.workout
                ? this.translationService.t("chat.previewWorkout") + ": " + this.workoutName(message.workout)
                : this.translationService.t("chat.workoutDeleted");
        }

        return message.content ?? this.translationService.t("chat.unreadable");
    }

    imageUrl(message: ChatMessage): string | null | undefined {
        return message.attachment ? this.chatService.attachmentUrls()[message.attachment.id] : null;
    }

    // Bubble width of a picture, by its size when the app sent it.
    imageWidth(message: ChatMessage): number {
        const width = message.attachment?.width;
        return width ? Math.min(width, IMAGE_BUBBLE_WIDTH) : IMAGE_BUBBLE_WIDTH;
    }

    // Reserves the space before the picture loads so the list doesn't jump.
    imageRatio(message: ChatMessage): string | null {
        const attachment = message.attachment;
        return attachment?.width && attachment.height ? attachment.width + " / " + attachment.height : null;
    }

    workoutName(workout: ChatWorkout): string {
        return getTranslation(workout.name, this.translationService.language());
    }

    workoutTypes(workout: ChatWorkout): string {
        return (workout.workoutTypes ?? [])
            .map((type) => getTranslation(type.name, this.translationService.language()))
            .filter(Boolean)
            .join(", ");
    }

    // Unknown codes (added to the API later) are shown as they are.
    muscleName(code: string): string {
        const key = "muscles." + code;
        const name = this.translationService.t(key);
        return name === key ? code.replace(/_/g, " ") : name;
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
        this.previewUrl = null;
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
                this.loadImages(messages);

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
                this.onSendError(err);
            },
        });
    }

    chooseImage(): void {
        if (this.sendingImage) return;
        this.imageInput?.nativeElement.click();
    }

    // The draft goes along as the caption.
    async onImageSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        // Lets the same file be picked again.
        input.value = "";

        const conversation = this.selected();
        if (!file || !conversation || !conversation.isEnabled || this.sendingImage) return;

        this.sendingImage = true;

        let image: PreparedImage;
        try {
            image = await this.prepareImage(file);
        } catch {
            this.sendingImage = false;
            this.showWarning("chat.imageInvalid");
            return;
        }

        if (image.blob.size > MAX_IMAGE_BYTES) {
            this.sendingImage = false;
            this.showWarning("chat.imageTooLarge");
            return;
        }

        const caption = this.draft.trim();

        this.chatService.sendImage(conversation.id, image.blob, image.fileName, caption, image.width, image.height)
            .subscribe({
                next: (message) => {
                    this.sendingImage = false;
                    // The draft was sent as the caption, unless it was changed meanwhile.
                    if (this.draft.trim() === caption) this.draft = "";
                    this.addMessage(message);
                },
                error: (err) => {
                    this.sendingImage = false;
                    if (err?.status === 413) {
                        this.showWarning("chat.imageTooLarge");
                        return;
                    }
                    this.onSendError(err);
                },
            });
    }

    openImage(message: ChatMessage): void {
        const url = this.imageUrl(message);
        if (url) this.previewUrl = url;
    }

    // Retries a picture that couldn't be loaded.
    reloadImage(message: ChatMessage): void {
        if (!message.attachment) return;

        const urls = { ...this.chatService.attachmentUrls() };
        delete urls[message.attachment.id];
        this.chatService.attachmentUrls.set(urls);
        this.chatService.loadAttachment(message.conversationId, message.attachment.id);
    }

    // Coaches share one of the workouts with an optional note.
    openShareWorkout(): void {
        this.workoutId = null;
        this.workoutNote = "";
        this.workoutVisible = true;

        if (this.workoutOptions.length || this.loadingWorkouts) return;

        this.loadingWorkouts = true;
        this.workoutService.getWorkouts(false).subscribe({
            next: (workouts) => {
                this.loadingWorkouts = false;
                this.workoutOptions = workouts
                    .map((workout) => ({ id: workout.id, name: getTranslation(workout.name, this.translationService.language()) }))
                    .sort((a, b) => a.name.localeCompare(b.name, this.translationService.locale()));
            },
            error: (err) => {
                this.loadingWorkouts = false;
                this.showError(err);
            },
        });
    }

    shareWorkout(): void {
        const conversation = this.selected();
        if (!conversation || !conversation.isEnabled || !this.workoutId || this.sendingWorkout) return;

        this.sendingWorkout = true;

        this.chatService.sendMessage(conversation.id, this.workoutNote.trim(), this.workoutId).subscribe({
            next: (message) => {
                this.sendingWorkout = false;
                this.workoutVisible = false;
                this.addMessage(message);
            },
            error: (err) => {
                this.sendingWorkout = false;
                this.onSendError(err);
                if (err?.status === 400) this.workoutVisible = false;
            },
        });
    }

    // Block and report are in a menu so the header fits on phones.
    openMenu(event: Event, conversation: ChatConversation): void {
        const t = (key: string) => this.translationService.t(key);

        this.menuItems = [
            ...(this.isCoach ? [] : [{
                label: t(conversation.isBlockedByClient ? "chat.unblock" : "chat.block"),
                icon: conversation.isBlockedByClient ? "pi pi-unlock" : "pi pi-ban",
                command: () => conversation.isBlockedByClient ? this.setBlocked(conversation, false) : this.confirmBlock(conversation),
            }]),
            {
                label: t("chat.report"),
                icon: "pi pi-flag",
                command: () => this.openReport(),
            },
        ];

        this.menu?.toggle(event);
    }

    // Unblocking is harmless, only blocking asks first.
    confirmBlock(conversation: ChatConversation): void {
        this.confirmationService.confirm({
            header: this.translationService.t("chat.block"),
            message: this.translationService.t("chat.blockConfirm"),
            icon: "pi pi-ban",
            closable: true,
            closeOnEscape: true,
            rejectButtonProps: {
                label: this.translationService.t("chat.cancel"),
                severity: "secondary",
                outlined: true,
            },
            acceptButtonProps: {
                label: this.translationService.t("chat.blockAction"),
                severity: "danger",
            },
            accept: () => this.setBlocked(conversation, true),
        });
    }

    setBlocked(conversation: ChatConversation, isBlocked: boolean): void {
        this.chatService.setBlocked(conversation.id, isBlocked).subscribe({
            next: (updated) => {
                this.updateConversation(conversation.id, {
                    isEnabled: updated.isEnabled,
                    isBlockedByClient: updated.isBlockedByClient,
                });
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t(isBlocked ? "chat.blockedDetail" : "chat.unblockedDetail"),
                });
            },
            error: (err) => this.showError(err),
        });
    }

    openReport(): void {
        this.reportReason = "";
        this.reportVisible = true;
    }

    sendReport(): void {
        const conversation = this.selected();
        if (!conversation || this.reporting) return;

        this.reporting = true;

        this.chatService.report(conversation.id, this.reportReason.trim()).subscribe({
            next: () => {
                this.reporting = false;
                this.reportVisible = false;
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("chat.reportedDetail"),
                });
            },
            error: (err) => {
                this.reporting = false;
                if (err?.status === 429) {
                    this.showWarning("chat.reportTooMany");
                    return;
                }
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

    // Coaches pick one of their clients, clients one of their coaches.
    openNewChat(): void {
        this.newChatContactId = null;
        this.contactOptions = [];
        this.newChatVisible = true;

        this.chatService.getContacts().subscribe({
            next: (contacts) => {
                const listed = new Set(this.conversations().map((x) => x.id));

                // People already in the list are left out, except chats a coach
                // disabled, the coach can turn them back on from here.
                this.contactOptions = contacts
                    .filter((contact) => !contact.conversationId || !listed.has(contact.conversationId) ||
                        (this.isCoach && !contact.isEnabled && !contact.isBlockedByClient))
                    .map((contact) => ({ id: contact.id, fullName: contact.fullName }));
            },
            error: (err) => this.showError(err),
        });
    }

    startChat(): void {
        if (!this.newChatContactId) return;

        const request = this.isCoach
            ? this.chatService.setConversation(this.newChatContactId, true)
            : this.chatService.startConversation(this.newChatContactId);

        request.subscribe({
            next: (conversation) => {
                this.newChatVisible = false;

                const existing = this.conversations().find((x) => x.id === conversation.id);
                if (existing) {
                    this.updateConversation(conversation.id, {
                        isEnabled: conversation.isEnabled,
                        isBlockedByClient: conversation.isBlockedByClient,
                    });
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
                this.loadImages(messages);
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
            this.loadImages([message]);
            if (atBottom || this.isMine(message)) this.scrollToBottom();
        }

        this.updateConversation(message.conversationId, { lastMessage: message, lastMessageAt: message.createdAt });
        this.sortConversations();
    }

    private loadImages(messages: ChatMessage[]): void {
        messages.forEach((message) => {
            if (message.type === "image" && message.attachment) {
                this.chatService.loadAttachment(message.conversationId, message.attachment.id);
            }
        });
    }

    /**
     * Shrinks photos so the longer side is at most MAX_IMAGE_SIDE and encodes
     * them as JPEG. GIFs are sent as they are so they stay animated.
     */
    private async prepareImage(file: File): Promise<PreparedImage> {
        const image = await this.decodeImage(file);
        try {
            return await this.encodeImage(file, image);
        } finally {
            URL.revokeObjectURL(image.src);
        }
    }

    private async encodeImage(file: File, image: HTMLImageElement): Promise<PreparedImage> {
        const width = image.naturalWidth;
        const height = image.naturalHeight;

        if (file.type === "image/gif") {
            return { blob: file, fileName: file.name, width, height };
        }

        const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);

        const context = canvas.getContext("2d")!;
        // JPEG has no transparency, transparent PNGs would turn black.
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", IMAGE_QUALITY));
        if (!blob) throw new Error("Image can't be encoded.");

        const fileName = (file.name.replace(/\.[^.]+$/, "") || "image") + ".jpg";
        return { blob, fileName, width: canvas.width, height: canvas.height };
    }

    private decodeImage(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const image = new Image();

            // The URL is revoked after drawing, see prepareImage.
            image.onload = () => {
                if (image.naturalWidth && image.naturalHeight) resolve(image);
                else {
                    URL.revokeObjectURL(url);
                    reject(new Error("Image has no size."));
                }
            };
            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Image can't be decoded."));
            };
            image.src = url;
        });
    }

    // Coach disabled or client blocked the chat meanwhile (error 1101), shows it read only.
    private onSendError(err: any): void {
        this.showError(err);
        if (err?.status === 400) this.loadConversations();
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

    private showWarning(key: string): void {
        this.messageService.add({
            severity: "warn",
            summary: this.translationService.t("common.error"),
            detail: this.translationService.t(key),
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
