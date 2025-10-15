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

class MapService {
    constructor() {
        this.BASE_URL = `${BASE_URL}/map`;
        this.jwt_service = new JwtTokenService();
    }

    async fetchPosts(region) {
        try {
            const token = await this.jwt_service.getToken();
            if (!token) {
                console.log("No token available");
                return null;
            }

            const latDelta = region.latitudeDelta / 2;
            const lonDelta = region.longitudeDelta / 2;

            const lat_min = region.latitude - latDelta;
            const lat_max = region.latitude + latDelta;
            const lon_min = region.longitude - lonDelta;
            const lon_max = region.longitude + lonDelta;

            const zoom = Math.round(Math.log2(360 / region.longitudeDelta));

            const response = await axios.get(`${this.BASE_URL}/posts/map`, {
                params: {
                    lat_min,
                    lat_max,
                    lon_min,
                    lon_max,
                    zoom
                },
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            if (error.response?.status === 401) {
                try {
                    const newToken = await this.jwt_service.refreshToken();
                    if (newToken) {
                        return this.fetchPosts(region);
                    }
                } catch (refreshError) {
                    console.log("Error refreshing token:", refreshError);
                }
            } else {
                console.log("Error fetching posts:", error);
            }
        }

        return null;
    }
}

export default MapService;
