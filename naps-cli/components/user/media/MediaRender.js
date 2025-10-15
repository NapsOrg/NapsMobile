/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React from "react";
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    Text,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

const MAX_GRID_WIDTH = 600;

const MediaGrid = ({ screenWidth, mediaItems }) => {
    const navigation = useNavigation();

    if (!mediaItems || mediaItems.length === 0) {
        return null;
    }

    const containerWidth = Math.min(screenWidth, MAX_GRID_WIDTH);
    const gap = 2;
    const itemsPerRow = 3;
    const itemWidth = (containerWidth - gap * itemsPerRow) / itemsPerRow;
    const itemHeight = itemWidth;

    const handleMediaPress = (mediaItem) => {
        console.log("Media pressed:", mediaItem.mediaId);
        console.log("Loading media with ID:", mediaItem.mediaId);

        if (navigation && mediaItem.mediaId) {
            navigation.navigate("PostDetail", { postId: mediaItem.postId });
        }
    };

    return (
        <View style={[styles.mediaGrid, { width: containerWidth }]}>
            {mediaItems.map((mediaItem, index) => (
                <TouchableOpacity
                    key={`${mediaItem.mediaId}-${index}`}
                    style={[
                        styles.mediaItem,
                        {
                            width: itemWidth,
                            height: itemHeight,
                            marginRight: (index + 1) % itemsPerRow === 0 ? 0 : gap,
                            marginBottom: gap,
                        },
                    ]}
                    onPress={() => handleMediaPress(mediaItem)}
                    activeOpacity={0.7}
                >
                    <Image
                        source={{ uri: mediaItem.mediaUrl }}
                        style={styles.mediaImage}
                        resizeMode="cover"
                        onError={(error) => {
                            console.warn(`Failed to load media ${mediaItem.mediaId}:`, error);
                        }}
                    />

                    <View style={styles.imageOverlay} />

                    {mediaItem.mediaType === 'VIDEO' && (
                        <View style={styles.videoIndicator}>
                            <View style={styles.playIconContainer}>
                                <Text style={styles.videoIcon}>▶</Text>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const renderMediaGrid = (screenWidth, mediaItems) => {
    return <MediaGrid screenWidth={screenWidth} mediaItems={mediaItems} />;
};

const styles = StyleSheet.create({
    mediaGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
    },

    mediaItem: {
        overflow: "hidden",
        backgroundColor: '#1a1a1a',
        position: "relative",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },

    mediaImage: {
        width: "100%",
        height: "100%",
        backgroundColor: '#1a1a1a',
    },

    imageOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.03)",
    },

    videoIndicator: {
        position: "absolute",
        bottom: 8,
        right: 8,
    },

    playIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 4,
    },

    videoIcon: {
        fontSize: 14,
        color: "#000000",
        marginLeft: 2,
        fontWeight: "600",
    },
});

export default renderMediaGrid;