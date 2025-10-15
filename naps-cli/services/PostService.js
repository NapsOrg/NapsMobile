/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import axios from "axios";
import JwtTokenService from "./JwtTokenService";
import { BASE_URL } from "../config.js";
import PostScheme from "../schemas/media/PostScheme";
import MediaScheme from "../schemas/media/MediaScheme";

class PostService {
    constructor() {
        this.baseUrl = `${BASE_URL}/post`;
        this.jwtService = new JwtTokenService();
    }

    async request(method, url, data = null, config = {}) {
        let token = await this.jwtService.getToken();
        if (!token) throw new Error("No authentication token found");

        const doRequest = async (authToken) => {
            const headers = {
                Authorization: `Bearer ${authToken}`,
                ...(config.headers || {}),
            };
            const response = await axios({
                method,
                url: this.baseUrl + url,
                data,
                params: config.params || {},
                headers,
            });
            return response.data;
        };

        try {
            return await doRequest(token);
        } catch (error) {
            if (error.response?.status === 401) {
                try {
                    const refreshed = await this.jwtService.refreshToken();
                    return await doRequest(refreshed);
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    throw refreshError;
                }
            }
            console.error(`Request error [${method} ${url}]:`, error);
            throw error;
        }
    }

    async createPost({ content, file, longitude, latitude, city, showOnMap }) {
        const formData = new FormData();

        formData.append("longitude", longitude.toString());
        formData.append("latitude", latitude.toString());
        formData.append("city", city);
        formData.append("show_on_map", Boolean(showOnMap).toString());

        if (content) {
            formData.append("content", content);
        }

        if (file) {
            formData.append("file", file);
        }

        const data = await this.request("post", "/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
        });

        return PostScheme.fromApi(data);
    }

    async getUserPosts(userId) {
        if (!userId) throw new Error("User ID is required");
        const data = await this.request("get", `/user/${userId}`);

        const postsData = data?.data || data || [];

        if (Array.isArray(postsData)) {
            return PostScheme.fromApiArray(postsData);
        }

        if (postsData && typeof postsData === 'object') {
            return [PostScheme.fromApi(postsData)];
        }

        return [];
    }

    async getUserMedia(userId) {
        if (!userId) throw new Error("User ID is required");
        const data = await this.request("get", `/user/${userId}/media`);
        return MediaScheme.fromApiArray(data);
    }

    async getRecentPosts(limit = 50) {
        const data = await this.request("get", "/recent", null, {
            params: { limit },
        });

        const postsData = data?.data || data || [];

        if (Array.isArray(postsData)) {
            return PostScheme.fromApiArray(postsData);
        }

        return [];
    }

    async getPostById(postId) {
        if (!postId) throw new Error("Post ID is required");

        try {
            const data = await this.request("get", `/${postId}`);

            const postData = data?.data || data;

            if (!postData) {
                throw new Error("No post data received");
            }

            return PostScheme.fromApi(postData);
        } catch (error) {
            console.error("Error in getPostById:", error);
            throw error;
        }
    }

    async deletePost(postId) {
        if (!postId) throw new Error("Post ID is required");
        const data = await this.request("delete", `/${postId}`);
        return data;
    }

    async addLike(postId) {
        if (!postId) throw new Error("Post ID is required");
        const data = await this.request("post", `/reaction/${postId}`, {
            reaction: "LIKE"
        });
        return data;
    }

    async removeLike(postId) {
        if (!postId) throw new Error("Post ID is required");
        const data = await this.request("delete", `/reaction/${postId}`);
        return data;
    }

    // Save/Bookmark methods
    async savePost(postId) {
        if (!postId) throw new Error("Post ID is required");
        const data = await this.request("post", `/save/${postId}`);
        return data;
    }

    async unsavePost(postId) {
        if (!postId) throw new Error("Post ID is required");
        const data = await this.request("delete", `/save/${postId}`);
        return data;
    }

    async getSavedPosts(limit = 50) {
        const data = await this.request("get", "/saved", null, {
            params: { limit }
        });

        const postsData = data?.data || data || [];

        if (Array.isArray(postsData)) {
            return PostScheme.fromApiArray(postsData);
        }

        return [];
    }

    async addReaction(postId, reactionType) {
        console.warn("addReaction is deprecated. Use addLike instead.");
        return this.addLike(postId);
    }

    async removeReaction(postId) {
        console.warn("removeReaction is deprecated. Use removeLike instead.");
        return this.removeLike(postId);
    }

    setAuthToken(token) {
        console.warn(
            "setAuthToken is deprecated. Tokens are now managed automatically."
        );
    }
}

export default PostService;