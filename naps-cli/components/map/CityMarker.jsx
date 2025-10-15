/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { Marker } from "react-native-maps";
import { View, StyleSheet } from "react-native";

const CityMarker = ({ searchedLocation }) => {
    return (
        <Marker coordinate={searchedLocation}>
            <View style={styles.searchMarkerContainer}>
                <View style={styles.searchMarkerPin}>
                    <View style={styles.searchMarkerInner} />
                </View>
                <View style={styles.searchMarkerShadow} />
            </View>
        </Marker>
    );
};

const styles = StyleSheet.create({
    searchMarkerContainer: {
        alignItems: "center",
        justifyContent: "flex-end",
        height: 40,
    },
    searchMarkerPin: {
        width: 25,
        height: 25,
        backgroundColor: "#9561FB",
        borderRadius: 20,
        borderWidth: 5,
        borderColor: "#9561FB",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#9561FB",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 8,
        transform: [{ translateY: -5 }],
    },
    searchMarkerInner: {
        width: 16,
        height: 16,
        backgroundColor: "#fff",
        borderRadius: 8,
    },
    searchMarkerShadow: {
        width: 16,
        height: 6,
        backgroundColor: "rgba(0,0,0,0.2)",
        borderRadius: 8,
        marginTop: -8,
    },
});

export default CityMarker;