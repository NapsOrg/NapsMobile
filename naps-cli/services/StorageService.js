/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

class StorageService {
    constructor() {
        this.storage = AsyncStorage;
        this.USER_DATA_KEY = "userData";
        this.USER_PROFILE_KEY = "userProfile";
    }
    async saveUserData(userData) {
        try {
            if (!userData) return;

            const dataToSave = {
                userName: userData.userName || userData.username || null,
                fullName: userData.fullName || userData.full_name || null,
                avatar: userData.avatar || userData.avatar_url || null,
                userId: userData.userId || userData.user_id || null,
                timestamp: new Date().toISOString(),
            };

            const filteredData = Object.fromEntries(
                Object.entries(dataToSave).filter(([_, v]) => v !== null && v !== undefined)
            );

            await this.storage.setItem(
                this.USER_DATA_KEY,
                JSON.stringify(filteredData)
            );
        } catch (error) {
            console.error("Error saving user data:", error);
        }
    }

    async saveUserProfile(userProfile) {
        try {
            if (!userProfile) return;

            const profileToSave = {
                user_id: userProfile.user_id,
                username: userProfile.username,
                full_name: userProfile.full_name,
                bio: userProfile.bio,
                city: userProfile.city,
                avatar_url: userProfile.avatar_url,
                followers: userProfile.followers,
                following: userProfile.following,
                likes: userProfile.likes,
                online_status: userProfile.online_status,
                register_date: userProfile.register_date,
                is_following: userProfile.is_following || false,
                timestamp: new Date().toISOString(),
            };

            await this.storage.setItem(
                this.USER_PROFILE_KEY,
                JSON.stringify(profileToSave)
            );
        } catch (error) {
            console.error("Error saving user profile:", error);
        }
    }

    async getUserData() {
        try {
            const jsonValue = await this.storage.getItem(this.USER_DATA_KEY);
            return jsonValue ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error("Error reading user data:", error);
            return null;
        }
    }

    async getUserProfile() {
        try {
            const jsonValue = await this.storage.getItem(this.USER_PROFILE_KEY);
            return jsonValue ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error("Error reading user profile:", error);
            return null;
        }
    }

    async updateUserProfile(updates) {
        try {
            const existing = await this.getUserProfile();
            const updated = { ...existing, ...updates, timestamp: new Date().toISOString() };
            await this.storage.setItem(
                this.USER_PROFILE_KEY,
                JSON.stringify(updated)
            );
        } catch (error) {
            console.error("Error updating user profile:", error);
        }
    }

    async clearUserData() {
        try {
            await this.storage.multiRemove([this.USER_DATA_KEY, this.USER_PROFILE_KEY]);
        } catch (error) {
            console.error("Error clearing user data:", error);
        }
    }

    async clearUserProfile() {
        try {
            await this.storage.removeItem(this.USER_PROFILE_KEY);
        } catch (error) {
            console.error("Error clearing user profile:", error);
        }
    }

    async getAllUserData() {
        try {
            const [userData, userProfile] = await Promise.all([
                this.getUserData(),
                this.getUserProfile(),
            ]);
            return { userData, userProfile };
        } catch (error) {
            console.error("Error reading all user data:", error);
            return { userData: null, userProfile: null };
        }
    }
}

export default new StorageService();