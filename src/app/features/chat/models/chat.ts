import { Workout } from "../../workouts/models/workout";

export interface ChatParticipant {
    // Coach or client id.
    id: string;
    userId: string;
    fullName: string;
}

export type ChatMessageType = "text" | "image" | "workout";

// Picture of an image message, loaded from GET .../attachments/{id}.
export interface ChatAttachment {
    id: string;
    contentType: string;
    // As sent by the app, to reserve the space before the picture loads.
    width: number | null;
    height: number | null;
}

// Workout as GET /workouts returns it, without the display values the workouts page adds.
export type ChatWorkout = Omit<Workout, "displayName" | "displayDescription" | "displayWorkoutTypes" | "displayWorkoutTypeList"> & {
    // Muscle codes ("chest", "upper_back"...), primary and helping ones.
    muscles?: string[];
    secondaryMuscles?: string[];
};

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderUserId: string;
    // Null when the server can't decrypt the message. Caption of
    // an image and note of a workout, may be empty for those.
    content: string | null;
    createdAt: string;
    readAt: string | null;
    // Older messages may come without it, they are all text.
    type?: ChatMessageType;
    attachment?: ChatAttachment | null;
    // Null when the shared workout was deleted.
    workout?: ChatWorkout | null;
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
    // Read only until the client unblocks it, the coach can't turn it on.
    isBlockedByClient: boolean;
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
    // False when the coach disabled the chat or the client blocked it.
    isEnabled: boolean;
    isBlockedByClient: boolean;
}
