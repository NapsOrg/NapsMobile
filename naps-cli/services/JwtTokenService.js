/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import axios from 'axios';

import { TOKEN_KEY, REFRESH_KEY, BASE_URL } from '../config.js';
import RefreshSchema from '../schemas/auth/RefreshSchema';

class JwtTokenService {
    constructor() {
        this.base_uri = `${BASE_URL}/auth`;
        this.platform = Platform.OS;
    }

    async getToken() {
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (error) {
            console.error("Error retrieving token:", error);
            return null;
        }
    }

    async getRefreshToken() {
        try {
            return await SecureStore.getItemAsync(REFRESH_KEY);
        } catch (error) {
            console.error("Error retrieving refresh token:", error);
            return null;
        }
    }

    async removeToken() {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_KEY);
        } catch (error) {
            console.error("Error removing tokens:", error);
            throw error;
        }
    }

    async refreshToken() {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) {
            throw new Error("No refresh token available");
        }

        try {
            const refreshSchema = new RefreshSchema(refreshToken);
            const res = await axios.post(`${this.base_uri}/refresh`, refreshSchema);

            const access_token = res.data.access_token;
            await SecureStore.setItemAsync(TOKEN_KEY, access_token);

            return access_token;
        } catch (error) {
            console.error("Error refreshing token:", error);
            throw error;
        }
    }

    async isAuthenticated() {
        const token = await this.getToken();
        return token !== null;
    }
}

export default JwtTokenService;