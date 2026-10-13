export interface ChatParticipant {
    // Coach or client id.
    id: string;
    userId: string;
    fullName: string;
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderUserId: string;
    // Null when the server can't decrypt the message.
    content: string | null;
    createdAt: string;
    readAt: string | null;
}

export interface ChatConversation {
    id: string;
    coach: ChatParticipant;
    client: ChatParticipant;
    isEnabled: boolean;
    lastMessageAt: string | null;
    lastMessage: ChatMessage | null;
    // Messages of the other side the logged user hasn't read yet.
    unreadCount: number;
}

export interface MessagesReadEvent {
    conversationId: string;
    readerUserId: string;
    readAt: string;
}

// Coach or client the logged user can chat with.
export interface ChatContact {
    id: string;
    userId: string;
    fullName: string;
    // Null when they haven't started a chat yet.
    conversationId: string | null;
    // False when the coach disabled the chat.
    isEnabled: boolean;
}
