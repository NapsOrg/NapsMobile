/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

class ChatSchema {
    constructor(
        chatId,
        userId,
        username,
        avatarUrl,
        lastMessage,
        lastMessageAt,
        unreadCount,
        isRead = false,
        createdAt = new Date()
    ) {
        this.chatId = chatId;
        this.userId = userId;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.lastMessage = lastMessage;
        this.lastMessageAt = lastMessageAt;
        this.unreadCount = unreadCount;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    toJSON() {
        return {
            chatId: this.chatId,
            userId: this.userId,
            username: this.username,
            avatarUrl: this.avatarUrl,
            lastMessage: this.lastMessage,
            lastMessageAt: this.lastMessageAt,
            unreadCount: this.unreadCount,
            isRead: this.isRead,
            createdAt: this.createdAt
        };
    }

    static fromJSON(data) {
        return new ChatSchema(
            data.chatId,
            data.userId,
            data.username,
            data.avatarUrl,
            data.lastMessage,
            data.lastMessageAt,
            data.unreadCount,
            data.isRead,
            data.createdAt
        );
    }

    static fromApi(apiData) {
        return new ChatSchema(
            apiData.chat_id,
            apiData.user_id,
            apiData.username,
            apiData.profile_picture_url || apiData.avatar_url,
            apiData.last_message,
            apiData.last_message_time || apiData.last_message_at,
            apiData.unread_messages_count || apiData.unread_count,
            apiData.is_read || false,
            apiData.created_at ? new Date(apiData.created_at) : new Date()
        );
    }
}