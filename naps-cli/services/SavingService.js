/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import axios from "axios";
import JwtTokenService from "./JwtTokenService";
import { BASE_URL } from "../config";
import { SavedScheme } from "../schemas/saved/SavedScheme";

class SavingService {
    constructor() {
        this.baseUrl = `${BASE_URL}/saved`;
        this.jwtService = new JwtTokenService();
    }

    async request(method, url, data = null, config = {}) {
        const token = await this.jwtService.getToken();
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

    async savePost(postId) {
        if (!postId) throw new Error("Post ID is required");
        const data = await this.request("post", `/posts/${postId}`);
        return SavedScheme.fromApi(data);
    }

    async unsavePost(postId) {
        if (!postId) throw new Error("Post ID is required");

        try {
            await this.request("delete", `/posts/${postId}`);
            return true;
        } catch (error) {
            // If post not saved, treat as successful "unsave"
            if (error.response?.status === 404) {
                console.warn(`Post ${postId} was not saved, ignoring 404.`);
                return false;
            }
            throw error;
        }
    }

    async toggleSave(postId) {
        if (!postId) throw new Error("Post ID is required");

        const isSaved = await this.checkPostSaved(postId);

        if (isSaved) {
            await this.unsavePost(postId);
            return { postId, isSaved: false };
        } else {
            const saved = await this.savePost(postId);
            return { postId, isSaved: true, saved };
        }
    }

    async getSavedPosts(limit = 100, offset = 0) {
        const data = await this.request("get", "/", null, {
            params: { limit, offset },
        });

        const savedData = data?.data || data || [];

        if (Array.isArray(savedData)) {
            return SavedScheme.fromApiArray(savedData);
        }

        return [];
    }

    async getSavedPostById(savedId) {
        if (!savedId) throw new Error("Saved ID is required");
        const data = await this.request("get", `/${savedId}`);
        return SavedScheme.fromApi(data);
    }

    async checkPostSaved(postId) {
        if (!postId) throw new Error("Post ID is required");
        const data = await this.request("get", `/posts/${postId}/check`);
        return data?.is_saved ?? false;
    }

    async deleteSavedItem(savedId) {
        if (!savedId) throw new Error("Saved ID is required");
        await this.request("delete", `/${savedId}`);
        return true;
    }
}

export default SavingService;