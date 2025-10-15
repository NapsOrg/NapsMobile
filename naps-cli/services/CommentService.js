/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import axios from "axios";
import JwtTokenService from "./JwtTokenService";
import {BASE_URL} from "../config";
import CommentScheme from "../schemas/comment/CommentScheme";

class CommentService {
    constructor() {
        this.jwtService = new JwtTokenService();
        this.BASE_URL = BASE_URL;
    }

    async getAuthToken() {
        return await this.jwtService.getToken();
    }

    async getAuthHeaders() {
        const token = await this.getAuthToken();
        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    async createComment(postId, content) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.post(
                `${this.BASE_URL}/comment/create`,
                { post_id: postId, content },
                { headers }
            );
            return CommentScheme.fromApi(response.data);
        } catch (error) {
            console.error("Error creating comment:", error);
            throw error;
        }
    }

    async getPostComments(postId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(
                `${this.BASE_URL}/comment/post/${postId}`,
                { headers }
            );
            return CommentScheme.fromApiArray(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
            throw error;
        }
    }

    async getCommentById(commentId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(
                `${this.BASE_URL}/comment/${commentId}`,
                { headers }
            );
            return CommentScheme.fromApi(response.data);
        } catch (error) {
            console.error("Error fetching comment:", error);
            throw error;
        }
    }

    async updateComment(commentId, content) {
        try {
            const headers = await this.getAuthHeaders();
            await axios.patch(
                `${this.BASE_URL}/comment/${commentId}`,
                { comment_id: commentId, content },
                { headers }
            );
            return true;
        } catch (error) {
            console.error("Error updating comment:", error);
            throw error;
        }
    }

    async deleteComment(commentId) {
        try {
            const headers = await this.getAuthHeaders();
            await axios.delete(
                `${this.BASE_URL}/comment/${commentId}`,
                { headers }
            );
            return true;
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }
    }

    async addCommentLike(commentId) {
        try {
            const headers = await this.getAuthHeaders();
            await axios.post(
                `${this.BASE_URL}/comment/reaction/${commentId}`,
                null,
                {
                    headers,
                    params: { reaction: "LIKE" }
                }
            );
            return true;
        } catch (error) {
            console.error("Error adding like to comment:", error);
            throw error;
        }
    }

    async removeCommentLike(commentId) {
        try {
            const headers = await this.getAuthHeaders();
            await axios.delete(
                `${this.BASE_URL}/comment/reaction/${commentId}`,
                { headers }
            );
            return true;
        } catch (error) {
            console.error("Error removing like from comment:", error);
            throw error;
        }
    }

    async createReply(commentId, content) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.post(
                `${this.BASE_URL}/comment-replies/`,
                { comment_id: commentId, content },
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error("Error creating reply:", error);
            throw error;
        }
    }

    async getCommentReplies(commentId, skip = 0, limit = 20) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(
                `${this.BASE_URL}/comment-replies/comment/${commentId}`,
                {
                    headers,
                    params: { skip, limit }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching replies:", error);
            throw error;
        }
    }

    async updateReply(replyId, content) {
        try {
            const headers = await this.getAuthHeaders();
            await axios.put(
                `${this.BASE_URL}/comment-replies/${replyId}`,
                { content },
                { headers }
            );
            return true;
        } catch (error) {
            console.error("Error updating reply:", error);
            throw error;
        }
    }

    async deleteReply(replyId) {
        try {
            const headers = await this.getAuthHeaders();
            await axios.delete(
                `${this.BASE_URL}/comment-replies/${replyId}`,
                { headers }
            );
            return true;
        } catch (error) {
            console.error("Error deleting reply:", error);
            throw error;
        }
    }

    async addReplyReaction(replyId, reactionType = "LIKE") {
        try {
            const headers = await this.getAuthHeaders();
            await axios.post(
                `${this.BASE_URL}/comment-replies/${replyId}/reaction`,
                null,
                {
                    headers,
                    params: { reaction_type: reactionType }
                }
            );
            return true;
        } catch (error) {
            console.error("Error adding reaction to reply:", error);
            throw error;
        }
    }

    async removeReplyReaction(replyId) {
        try {
            const headers = await this.getAuthHeaders();
            await axios.delete(
                `${this.BASE_URL}/comment-replies/${replyId}/reaction`,
                { headers }
            );
            return true;
        } catch (error) {
            console.error("Error removing reaction from reply:", error);
            throw error;
        }
    }
}

export default CommentService;