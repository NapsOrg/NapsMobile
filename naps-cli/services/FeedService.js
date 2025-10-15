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
import PostScheme from "../schemas/media/PostScheme";

class FeedService {
    constructor() {
        this.BASE_URL = `${BASE_URL}/feed`;
        this.jwt_service = new JwtTokenService();
    }

    async getFeed() {
        let token = await this.jwt_service.getToken();

        try {
            const res = await axios(`${this.BASE_URL}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            return PostScheme.fromApiArray(res.data);
        } catch (error) {
            if (error.response?.status === 403) {
                token = await this.jwt_service.refreshToken();
                const res = await axios(`${this.BASE_URL}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                return PostScheme.fromApiArray(res.data);
            }
            throw error;
        }
    }
}

export default FeedService;