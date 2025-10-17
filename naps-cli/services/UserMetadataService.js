/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import axios from "axios";

class UserMetadataService {
    constructor() {
        this.apiTimeout = 10000;
        this.defaultMetadata = {
            os: null,
            device: null,
            app_version: null,
            ip_address: null,
        };
    }

    getOperatingSystem() {
        try {
            const platform = Platform.OS;
            const osVersion = Platform.Version;
            return `${platform}-${osVersion}`;
        } catch (error) {
            console.error("Error getting OS info:", error.message);
            return null;
        }
    }

    async getDeviceInfo() {
        try {
            const brand = Device.brand || "Unknown";
            const modelName = Device.modelName || "Unknown";
            const osVersion = Device.osVersion || "Unknown";

            return `${brand} ${modelName} (${osVersion})`;
        } catch (error) {
            console.error("Error getting device info:", error.message);
            return null;
        }
    }

    getAppVersion() {
        try {
            const version = Constants.expoConfig?.version || "Unknown";
            return version;
        } catch (error) {
            console.error("Error getting app version:", error.message);
            return null;
        }
    }

    async getPublicIpAddress() {
        try {
            const response = await axios.get("https://api.ipify.org?format=json", {
                timeout: this.apiTimeout,
            });

            if (response.data && response.data.ip) {
                return response.data.ip;
            }

            return null;
        } catch (error) {
            console.error("Error fetching IP address:", error.message);
            return null;
        }
    }

    async getUserMetadata() {
        try {
            console.log("Fetching user metadata...");

            const os = this.getOperatingSystem();
            const device = await this.getDeviceInfo();
            const app_version = this.getAppVersion();
            const ip_address = await this.getPublicIpAddress();

            const metadata = {
                os,
                device,
                app_version,
                ip_address,
            };

            console.log("User metadata fetched:", metadata);
            return metadata;
        } catch (error) {
            console.error("Error fetching user metadata:", error.message);
            return this.defaultMetadata;
        }
    }

    async getUserMetadataWithRetry(maxAttempts = 2) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`Metadata fetch attempt ${attempt}/${maxAttempts}`);
                const metadata = await this.getUserMetadata();

                if (metadata.os || metadata.device || metadata.app_version) {
                    return metadata;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);

                if (attempt < maxAttempts) {
                    const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        console.error("All metadata fetch attempts failed");
        return this.defaultMetadata;
    }

    isValidMetadata(metadata) {
        return (
            metadata &&
            typeof metadata === "object" &&
            (metadata.os !== null ||
                metadata.device !== null ||
                metadata.app_version !== null ||
                metadata.ip_address !== null)
        );
    }
}

export default UserMetadataService;