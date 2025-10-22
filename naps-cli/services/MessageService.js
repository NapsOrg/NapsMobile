/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { BASE_URL } from "../config";
import JwtTokenService from "./JwtTokenService";

class MessageService {
    constructor() {
        this.WS_URL = BASE_URL.replace('http', 'ws').replace('https', 'wss');
        this.jwt_service = new JwtTokenService();
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.messageHandlers = [];
        this.pingInterval = null;
        this.messageHistory = [];
    }

    async connectWebSocket(chatId, userId, onMessage, onError, onClose) {
        try {
            this.disconnectWebSocket();

            const token = await this.jwt_service.getToken();
            const wsUrl = `${this.WS_URL}/messages/ws/chats/${chatId}/${userId}?token=${token}`;

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log(`WebSocket connected to chat ${chatId}`);
                this.reconnectAttempts = 0;
                this.startPingInterval();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("WebSocket message received:", data);

                    if (data.type === "message") {
                        this.messageHistory.push(data);
                    }

                    this.messageHandlers.forEach(handler => handler(data));

                    if (onMessage) {
                        onMessage(data);
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            this.ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                if (onError) {
                    onError(error);
                }
            };

            this.ws.onclose = (event) => {
                console.log("WebSocket closed:", event.code, event.reason);
                this.stopPingInterval();

                if (onClose) {
                    onClose(event);
                }

                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

                    setTimeout(() => {
                        this.connectWebSocket(chatId, userId, onMessage, onError, onClose);
                    }, this.reconnectDelay);
                }
            };

            return this.ws;
        } catch (error) {
            console.error("Error connecting to WebSocket:", error);
            throw error;
        }
    }

    getLocalMessageHistory(limit = 50) {
        return this.messageHistory.slice(-limit);
    }

    clearMessageHistory() {
        this.messageHistory = [];
    }

    startPingInterval() {
        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.sendMessage({
                    type: "ping",
                    timestamp: new Date().toISOString()
                });
            }
        }, 30000);
    }

    stopPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    disconnectWebSocket() {
        this.stopPingInterval();

        if (this.ws) {
            this.ws.close(1000, "Client disconnect");
            this.ws = null;
        }

        this.messageHandlers = [];
    }

    sendMessage(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error("WebSocket is not connected");
            throw new Error("WebSocket is not connected");
        }
    }

    sendTextMessage(message, replyToId = null) {
        this.sendMessage({
            type: "message",
            message: message.trim(),
            reply_to_id: replyToId
        });
    }

    sendTyping() {
        this.sendMessage({ type: "typing" });
    }

    sendStopTyping() {
        this.sendMessage({ type: "stop_typing" });
    }

    markAsRead(messageId) {
        this.sendMessage({
            type: "mark_as_read",
            message_id: messageId
        });
    }

    markAllAsRead() {
        this.sendMessage({ type: "mark_all_as_read" });
    }

    deleteMessage(messageId) {
        this.sendMessage({
            type: "delete_message",
            message_id: messageId
        });
    }

    editMessage(messageId, newMessage) {
        this.sendMessage({
            type: "edit_message",
            message_id: messageId,
            message: newMessage.trim()
        });
    }

    addMessageHandler(handler) {
        this.messageHandlers.push(handler);
    }


    removeMessageHandler(handler) {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    getConnectionState() {
        if (!this.ws) return "CLOSED";

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return "CONNECTING";
            case WebSocket.OPEN:
                return "OPEN";
            case WebSocket.CLOSING:
                return "CLOSING";
            case WebSocket.CLOSED:
                return "CLOSED";
            default:
                return "UNKNOWN";
        }
    }
}

export default MessageService;