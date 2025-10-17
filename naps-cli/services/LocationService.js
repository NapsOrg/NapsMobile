/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { LOCATION_API, LOCATION_API_KEY } from "../config";
import * as Location from "expo-location";
import axios from "axios";

class LocationService {
    constructor() {
        this.locationApi = LOCATION_API;
        this.locationApiKey = LOCATION_API_KEY;
        this.apiTimeout = 10000;
        this.defaultLocation = {
            latitude: null,
            longitude: null,
            city: "",
            country: "",
            timezone: "",
        };
    }

    isValidCoordinates(latitude, longitude) {
        return (
            typeof latitude === "number" &&
            typeof longitude === "number" &&
            latitude !== 0 &&
            longitude !== 0 &&
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
        );
    }

    async getLocationDetails(latitude, longitude) {
        try {
            if (!this.isValidCoordinates(latitude, longitude)) {
                console.warn("Invalid coordinates provided");
                return { city: "", country: "", timezone: "" };
            }

            const response = await axios.get(this.locationApi, {
                params: {
                    key: this.locationApiKey,
                    lat: latitude,
                    lon: longitude,
                    format: "json",
                },
                timeout: this.apiTimeout,
            });

            if (!response.data || !response.status || response.status !== 200) {
                throw new Error("Invalid API response");
            }

            const address = response.data.address || {};
            const city = (address.city || address.town || address.village || "").trim();
            const country = (address.country || "").trim();
            const timezone = (response.data.timezone || "").trim();

            return { city, country, timezone };
        } catch (error) {
            const errorMsg = error.response?.status
                ? `API Error ${error.response.status}: ${error.message}`
                : error.message;
            console.error("Error fetching location details:", errorMsg);
            return { city: "", country: "", timezone: "" };
        }
    }

    async getUserLocation() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                console.warn("Location permission denied by user");
                return { latitude: null, longitude: null };
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: this.apiTimeout,
            });

            const { latitude, longitude } = loc.coords;

            if (!this.isValidCoordinates(latitude, longitude)) {
                throw new Error("Invalid coordinates received from device");
            }

            return { latitude, longitude };
        } catch (error) {
            console.error("Location fetch failed:", error.message);
            return { latitude: null, longitude: null };
        }
    }

    async getUserLocationData() {
        try {
            console.log("Fetching user location data...");

            const { latitude, longitude } = await this.getUserLocation();

            if (!this.isValidCoordinates(latitude, longitude)) {
                console.warn("Could not determine user location");
                return this.defaultLocation;
            }

            const { city, country, timezone } = await this.getLocationDetails(
                latitude,
                longitude
            );

            return { latitude, longitude, city, country, timezone };
        } catch (error) {
            console.error("getUserLocationData error:", error.message);
            return this.defaultLocation;
        }
    }

    async getUserLocationDataWithRetry(maxAttempts = 3) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`Location fetch attempt ${attempt}/${maxAttempts}`);
                const data = await this.getUserLocationData();

                if (this.isValidCoordinates(data.latitude, data.longitude)) {
                    return data;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error.message);

                if (attempt < maxAttempts) {
                    const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        console.error("All location fetch attempts failed");
        return this.defaultLocation;
    }
}

export default LocationService;