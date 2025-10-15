/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import axios from "axios";
import { BASE_URL } from "../config";
import JwtTokenService from "./JwtTokenService";

class LikeService {
    constructor() {
        this.BASE_URL = `${BASE_URL}/like`;
        this.jwt_service = new JwtTokenService();
    }

    async likePost(postId) {
        try {
            const token = await this.jwt_service.getToken();
            const response = await axios.post(
                `${this.BASE_URL}/post/${postId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Failed to like post:", error);
            throw error;
        }
    }

    async unlikePost(postId) {
        try {
            const token = await this.jwt_service.getToken();
            const response = await axios.delete(
                `${this.BASE_URL}/post/${postId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Failed to unlike post:", error);
            throw error;
        }
    }

    async getPostLikesCount(postId) {
        try {
            const token = await this.jwt_service.getToken();
            const response = await axios.get(
                `${this.BASE_URL}/post/${postId}/count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Failed to get post likes count:", error);
            throw error;
        }
    }
}

export default LikeService;