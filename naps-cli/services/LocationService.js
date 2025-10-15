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
    }

    async getCity(latitude, longitude) {
        try {
            const response = await axios.get(this.locationApi, {
                params: {
                    key: this.locationApiKey,
                    lat: latitude,
                    lon: longitude,
                    format: "json"
                }
            });

            return (
                response.data.address?.city ||
                response.data.address?.town ||
                response.data.address?.village ||
                ""
            );
        } catch (error) {
            console.error("Error fetching city:", error.message);
            return "";
        }
    }

    async getUserLocation() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.warn("Permission to access location was denied");
                return { latitude: 0, longitude: 0 };
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            return {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };
        } catch (error) {
            console.error("Location fetch failed:", error.message);
            return { latitude: 0, longitude: 0 };
        }
    }

    async getUserLocationData() {
        console.log("Getting user location data...");

        const { latitude, longitude } = await this.getUserLocation();
        const city = await this.getCity(latitude, longitude);

        return { latitude, longitude, city };
    }
}

export default LocationService;