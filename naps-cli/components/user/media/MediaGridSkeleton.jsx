/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import React, { useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    Animated,
} from "react-native";

const MAX_GRID_WIDTH = 600;

const MediaGridSkeleton = ({ screenWidth, count = 9 }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const shimmerOpacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    const containerWidth = Math.min(screenWidth, MAX_GRID_WIDTH);
    const gap = 2;
    const itemsPerRow = 3;
    const itemWidth = (containerWidth - gap * itemsPerRow) / itemsPerRow;
    const itemHeight = itemWidth;

    return (
        <View style={[styles.mediaGrid, { width: containerWidth }]}>
            {Array.from({ length: count }).map((_, index) => (
                <Animated.View
                    key={`skeleton-${index}`}
                    style={[
                        styles.skeletonItem,
                        {
                            width: itemWidth,
                            height: itemHeight,
                            marginRight: (index + 1) % itemsPerRow === 0 ? 0 : gap,
                            marginBottom: gap,
                            opacity: shimmerOpacity,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    mediaGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
    },
    skeletonItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        overflow: "hidden",
    },
});

export default MediaGridSkeleton;