/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import * as Location from "expo-location";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";

import CityMarker from "./CityMarker";
import UserMarker from "./UserMarker";
import MapHeader from "./MapHeader";
import MapNavBar from "./MapNavBar";
import ClusterBottomSheet from "./ClusterBottomSheet";
import MapService from "../../services/MapService";

const MapContainer = () => {
    const [location, setLocation] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [searchedLocation, setSearchedLocation] = useState(null);
    const [postClusters, setPostClusters] = useState([]);
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const mapRef = useRef(null);

    const mapService = new MapService();
    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setLocation(loc.coords);

            Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 5 },
                (loc) => {
                    setLocation(loc.coords);
                }
            );
        })();
    }, []);


    const handleRegionChangeComplete = async (region) => {
        const clusters = await mapService.fetchPosts(region);
        if (clusters) {
            setPostClusters(clusters);
        }
    };

    const handleSearch = async (cityName) => {
        if (!cityName.trim()) return;

        try {
            const geocoded = await Location.geocodeAsync(cityName);
            if (geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                setSearchedLocation({ latitude, longitude });

                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude,
                        longitude,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    }, 1000);
                }
            }
        } catch (error) {
            console.log("Geocoding error:", error);
        }
    };

    const centerOnUser = () => {
        if (mapRef.current && location) {
            setSearchedLocation(null);
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        }
    };

    const handlePlusPress = () => {
        navigation.navigate("CreatePost");
        console.log("Plus button pressed");
    };

    const handleClusterPress = (cluster) => {
        console.log(`Cluster with ${cluster.count} posts:`, cluster.posts);
        setSelectedCluster(cluster);
        setShowBottomSheet(true);
    };

    const handlePostPress = (postId) => {
        console.log("Opening post:", postId);
        navigation.navigate("PostDetail", { postId });
        setShowBottomSheet(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerOverlay}>
                <MapHeader onSearch={handleSearch} />
            </View>

            <MapView
                ref={mapRef}
                style={styles.map}
                customMapStyle={darkMode ? darkMapStyle : []}
                showsCompass={false}
                onRegionChangeComplete={handleRegionChangeComplete}
                initialRegion={{
                    latitude: location ? location.latitude : 50.0168,
                    longitude: location ? location.longitude : 22.0045,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {location && <UserMarker location={location} />}

                {searchedLocation && <CityMarker searchedLocation={searchedLocation} />}

                {postClusters.map((cluster, index) => {
                    const profilePic = cluster.posts?.[0]?.user?.profile_pic;

                    return (
                        <Marker
                            key={`cluster-${index}`}
                            coordinate={{
                                latitude: cluster.latitude,
                                longitude: cluster.longitude
                            }}
                            onPress={() => handleClusterPress(cluster)}
                        >
                            <View style={styles.postMarkerContainer}>
                                <View style={styles.postMarkerCircle}>
                                    <View style={styles.imageWrapper}>
                                        {profilePic ? (
                                            <Image
                                                source={{ uri: profilePic }}
                                                style={styles.postMarkerImage}
                                            />
                                        ) : (
                                            <View style={styles.postMarkerPlaceholder} />
                                        )}
                                    </View>
                                    {cluster.count > 1 && (
                                        <View style={styles.postMarkerBadge}>
                                            <Text style={styles.postMarkerBadgeText}>{cluster.count}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.postMarkerArrow} />
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            <MapNavBar
                onLocationPress={centerOnUser}
                onPlusPress={handlePlusPress}
                darkMode={darkMode}
                onThemeToggle={() => setDarkMode(!darkMode)}
            />

            <ClusterBottomSheet
                visible={showBottomSheet}
                onClose={() => {
                    setShowBottomSheet(false);
                    setSelectedCluster(null);
                }}
                posts={selectedCluster?.posts || []}
                onPostPress={handlePostPress}
                darkMode={darkMode}
            />
        </View>
    );
};

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0E0E10" }] },
    { elementType: "geometry.fill", stylers: [{ color: "#0E0E10" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#CCCCCC" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2A3542" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1c232d" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#FFFFFF" }] },
    { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#383e4c" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#9561FB" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#FFFFFF" }] },
    { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#9561FB" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#111821" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#88CCFF" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0fa24a" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#66FF99" }] },
    { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "on" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#DDDDDD" }] },
    { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
    { featureType: "poi.business", elementType: "geometry", stylers: [{ color: "#14181f" }] },
    { featureType: "poi.business", elementType: "labels.text.fill", stylers: [{ color: "#DDDDDD" }] },
    { featureType: "poi.business", elementType: "labels.icon", stylers: [{ visibility: "on" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#9561FB" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#9561FB" }] },
    { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#FFFFFF" }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2a3441" }] },
    { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#FFFFFF" }] },
    { featureType: "administrative", elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#FFFFFF" }] },
    { featureType: "administrative.locality", elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
];

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerOverlay: {
        position: "absolute",
        top: 10,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: "center",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    postMarkerContainer: {
        alignItems: "center",
        justifyContent: "flex-end",
        height: 45.5,
        width: 45.5,
    },
    postMarkerCircle: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#9561FB",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#9561FB",
        shadowOpacity: 0.5,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 8,
        overflow: "hidden",
    },
    imageWrapper: {
        width: "100%",
        height: "100%",
        borderRadius: 12.5,
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
    },
    postMarkerImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    postMarkerPlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#e8e8e8",
        borderRadius: 12.5,
    },
    postMarkerBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#9561FB",
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 6,
    },
    postMarkerBadgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
    },
    postMarkerArrow: {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#9561FB",
        marginTop: -1,
    },
});

export default MapContainer;