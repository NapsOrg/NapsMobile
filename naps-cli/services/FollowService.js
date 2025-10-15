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
import UserSearchScheme from '../schemas/user/UserSearchScheme.js';
import FollowUser from '../schemas/user/FollowUser.js';

class FollowService {
    constructor() {
        this.baseUrl = `${BASE_URL}/followers`;
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

            return response.data;
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

                    return response.data;
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    throw refreshError;
                }
            }

            console.error(`Request error [${method} ${url}]:`, error);
            throw error;
        }
    }

    async followUser(userId) {
        try {
            const data = await this.request('post', `/follow/${userId}`, {}, {
                headers: { 'Content-Type': 'application/json' }
            });
            return data;
        } catch (error) {
            console.error('Error following user:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to follow user';
            throw new Error(errorMessage);
        }
    }

    async unfollowUser(userId) {
        try {
            const data = await this.request('delete', `/unfollow/${userId}`);
            return data;
        } catch (error) {
            console.error('Error unfollowing user:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to unfollow user';
            throw new Error(errorMessage);
        }
    }

    async getFollowers(userId) {
        try {
            const data = await this.request('get', `/followers/${userId}`);

            if (!Array.isArray(data)) {
                console.error('Expected array, got:', data);
                return { followers: [] };
            }

            return {
                followers: data.map(user => new FollowUser(
                    user.user_id,
                    user.username,
                    user.full_name,
                    user.avatar_url,
                    user.have_stories,
                    user.is_following
                ))
            };
        } catch (error) {
            console.error('Error fetching followers:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to fetch followers';
            throw new Error(errorMessage);
        }
    }

    async getFollowing(userId) {
        try {
            const data = await this.request('get', `/following/${userId}`);

            if (!Array.isArray(data)) {
                console.error('Expected array, got:', data);
                return { following: [] };
            }

            return {
                following: data.map(user => new FollowUser(
                    user.user_id,
                    user.username,
                    user.full_name,
                    user.avatar_url,
                    user.have_stories,
                    user.is_following
                ))
            };
        } catch (error) {
            console.error('Error fetching following:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to fetch following';
            throw new Error(errorMessage);
        }
    }

    async getMyFollowers() {
        try {
            const data = await this.request('get', '/my-followers');

            // API returns array directly, not wrapped in object
            if (!Array.isArray(data)) {
                console.error('Expected array, got:', data);
                return { followers: [] };
            }

            return {
                followers: data.map(user => new FollowUser(
                    user.user_id,
                    user.username,
                    user.full_name,
                    user.avatar_url,
                    user.have_stories,
                    user.is_following
                ))
            };
        } catch (error) {
            console.error('Error fetching my followers:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to fetch your followers';
            throw new Error(errorMessage);
        }
    }

    async getMyFollowing() {
        try {
            const data = await this.request('get', '/my-following');

            if (!Array.isArray(data)) {
                console.error('Expected array, got:', data);
                return { following: [] };
            }

            return {
                following: data.map(user => new FollowUser(
                    user.user_id,
                    user.username,
                    user.full_name,
                    user.avatar_url,
                    user.have_stories,
                    user.is_following
                ))
            };
        } catch (error) {
            console.error('Error fetching my following:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to fetch your following';
            throw new Error(errorMessage);
        }
    }

    async isFollowing(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/is_following/${userId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${await this.jwtService.getToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Boolean(data.is_following);
        } catch (error) {
            console.error('Error checking follow status:', error);
            throw new Error('Failed to check follow status');
        }
    }

    async getFollowStats(userId) {
        try {
            const [followersResponse, followingResponse] = await Promise.all([
                this.getFollowers(userId),
                this.getFollowing(userId)
            ]);

            return {
                user_id: userId,
                followers_count: followersResponse.followers?.length || 0,
                following_count: followingResponse.following?.length || 0
            };
        } catch (error) {
            console.error('Error fetching follow stats:', error);
            throw new Error('Failed to fetch follow statistics');
        }
    }

    async batchCheckFollowStatus(userIds) {
        try {
            const promises = userIds.map(userId =>
                this.isFollowing(userId).catch(error => ({
                    user_id: userId,
                    is_following: false,
                    error: error.message
                }))
            );

            const results = await Promise.all(promises);

            return results.reduce((acc, result) => {
                acc[result.user_id] = result.is_following;
                return acc;
            }, {});
        } catch (error) {
            console.error('Error in batch follow status check:', error);
            throw new Error('Failed to check follow status for multiple users');
        }
    }

    async searchInFollowList(userId, query, type = 'followers') {
        try {
            const data = type === 'followers'
                ? await this.getFollowers(userId)
                : await this.getFollowing(userId);

            const users = data[type] || [];

            if (!query.trim()) {
                return users;
            }

            const searchQuery = query.toLowerCase();
            return users.filter(user => {
                const username = user.username?.toLowerCase() || "";
                const firstName = user.first_name?.toLowerCase() || "";
                const lastName = user.last_name?.toLowerCase() || "";
                const fullName = `${firstName} ${lastName}`.trim();

                return username.includes(searchQuery) ||
                    firstName.includes(searchQuery) ||
                    lastName.includes(searchQuery) ||
                    fullName.includes(searchQuery);
            });
        } catch (error) {
            console.error(`Error searching in ${type}:`, error);
            throw new Error(`Failed to search in ${type}`);
        }
    }

    async removeToken() {
        return await this.jwtService.removeToken();
    }

    async isAuthenticated() {
        return await this.jwtService.isAuthenticated();
    }
}

export default FollowService;