/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import axios from "axios";
import { BASE_URL } from "../config";
import ChatSchema from "../schemas/chat/ChatSchema";
import JwtTokenService from "./JwtTokenService";

class ChatService {
    constructor() {
        this.BASE_URL = `${BASE_URL}/chat`;
        this.jwt_service = new JwtTokenService();
    }

    async getAuthHeaders() {
        const token = await this.jwt_service.getToken();
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    }

    async getChats() {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(
                `${this.BASE_URL}/`,
                { headers }
            );

            if (!Array.isArray(response.data)) {
                console.error("Expected array of chats, got:", response.data);
                return [];
            }

            return response.data.map(chat => {
                const chatSchema = ChatSchema.fromApi(chat);
                return chatSchema.toJSON();
            });
        } catch (error) {
            console.error("Error fetching chats:", error);
            throw error;
        }
    }

    async createChat(clientId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.post(
                `${this.BASE_URL}/`,
                { client_id: clientId },
                { headers }
            );

            const chatSchema = ChatSchema.fromApi(response.data);
            return chatSchema.toJSON();
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error("User not found");
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data.detail || "Error creating chat");
            }
            console.error("Error creating chat:", error);
            throw error;
        }
    }

    async deleteChat(chatId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.delete(
                `${this.BASE_URL}/${chatId}`,
                { headers }
            );

            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error("Chat not found");
            } else if (error.response?.status === 403) {
                throw new Error("You don't have permission to delete this chat");
            }
            console.error("Error deleting chat:", error);
            throw error;
        }
    }
}

export default ChatService;