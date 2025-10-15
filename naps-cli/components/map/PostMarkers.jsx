/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { Marker } from "react-native-maps";
import { View, StyleSheet, Image, Text } from "react-native";

const PostMarkers = ({ clusters }) => {
    return clusters.map((cluster, index) => {
        const profilePic = cluster.posts[0]?.profilePic;

        return (
            <Marker
                key={`cluster-${index}`}
                coordinate={{
                    latitude: cluster.latitude,
                    longitude: cluster.longitude
                }}
                onPress={() => {
                    console.log(`Cluster with ${cluster.count} posts:`, cluster.posts);
                }}
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
    });
};

const styles = StyleSheet.create({
    postMarkerContainer: {
        alignItems: "center",
        justifyContent: "flex-end",
        height: 20,
    },
    postMarkerImage: {
        width: "20%",
        height: "20%",
        borderRadius: 10,
    },
    postMarkerBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#9561FB",
        minWidth: 5,
        height: 5,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    postMarkerBadgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "bold",
    },
});

export default PostMarkers;