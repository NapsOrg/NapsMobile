/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import axios from 'axios';

import JwtTokenService from './JwtTokenService';

import { BASE_URL } from '../config.js';
import UserMe from '../schemas/user/UserMe.js';
import UserClassic from '../schemas/user/UserClassic.js';

class UserService {
    constructor() {
        this.baseUrl = `${BASE_URL}/users`;
        this.jwtService = new JwtTokenService();
    }

    async request(method, url, data = null, config = {}) {
        let token = await this.jwtService.getToken();

        if (!token) {
            throw new Error("No authentication token found");
        }

        try {
            const headers = {
                Authorization: `Bearer ${token}`,
                ...(config.headers || {})
            };

            const response = await axios({
                method,
                url: this.baseUrl + url,
                data,
                params: config.params || {},
                headers,
            });

            return response;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    token = await this.jwtService.refreshToken();
                    const headers = {
                        Authorization: `Bearer ${token}`,
                        ...(config.headers || {})
                    };

                    const response = await axios({
                        method,
                        url: this.baseUrl + url,
                        data,
                        params: config.params || {},
                        headers,
                    });

                    return response;
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    throw refreshError;
                }
            }

            console.error(`Request error [${method} ${url}]:`, error);
            throw error;
        }
    }

    async getMyProfile() {
        const response = await this.request('get', '/me');
        return {
            status: response.status,
            data: new UserMe(response.data)
        };
    }

    async getUserById(user_id) {
        try {
            const response = await this.request('get', '/by-id', null, {
                params: { user_id: user_id.toString() }
            });

            return {
                status: response.status,
                data: new UserClassic(response.data)
            };
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            throw error;
        }
    }

    async getUserAvatarUrl() {
        try {
            const response = await this.request('get', '/avatar');
            return {
                status: response.status,
                data: response.data
            };
        } catch (error) {
            console.error("Error fetching user avatar URL:", error);
        }
    }

    async updateProfile(updates) {
        try {
            const response = await this.request('patch', '/me', updates);
            return {
                status: response.status,
                data: new UserMe(response.data)
            };
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    }

    async searchUsers(query, limit = 20) {
        try {
            const response = await this.request('get', '/search', null, {
                params: { query, limit }
            });

            return {
                status: response.status,
                data: response.data
            };
        } catch (error) {
            console.error("Error searching users:", error);
            throw error;
        }
    }

    async followUser(userId) {
        try {
            const response = await this.request('post', `/follow/${userId}`);
            return {
                status: response.status,
                data: response.data
            };
        } catch (error) {
            console.error("Error following user:", error);
            throw error;
        }
    }

    async unfollowUser(userId) {
        try {
            const response = await this.request('delete', `/follow/${userId}`);
            return {
                status: response.status,
                data: response.data
            };
        } catch (error) {
            console.error("Error unfollowing user:", error);
            throw error;
        }
    }

    async uploadAvatar(file) {
        try {
            const token = await this.jwtService.getToken();

            let fileUri = file.uri;
            if (!fileUri.startsWith("file://")) {
                fileUri = "file://" + fileUri;
            }

            const formData = new FormData();
            formData.append('file', {
                uri: fileUri,
                type: file.type || 'image/jpeg',
                name: file.name || 'avatar.jpg',
            });

            const response = await axios.put(
                `${this.baseUrl}/avatar`,
                formData,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                    timeout: 30000,
                }
            );

            return {
                status: response.status,
                data: response.data,
            };
        } catch (error) {
            console.error("Error uploading avatar:", error.message);
            console.error("Error response:", error.response?.data);
            throw error;
        }
    }

    async requestAccountDeletion() {
        try {
            const response = await this.request('post', '/delete-me');
            return {
                status: response.status,
                data: response.data
            };
        } catch (error) {
            console.error("Error requesting account deletion:", error);
            throw error;
        }
    }

    async confirmAccountDeletion(confirmCode) {
        try {
            const formData = new FormData();
            formData.append('confirm_code', confirmCode);

            const response = await this.request('delete', '/confirm-delete', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            return {
                status: response.status,
                data: response.data
            };
        } catch (error) {
            console.error("Error confirming account deletion:", error);
            throw error;
        }
    }

    async removeToken() {
        return await this.jwtService.removeToken();
    }

    async isAuthenticated() {
        return await this.jwtService.isAuthenticated();
    }
}

export default UserService;