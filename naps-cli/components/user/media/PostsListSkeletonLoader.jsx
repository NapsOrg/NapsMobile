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
import globalStyles from "../../../styles";

const PostsListSkeleton = ({ count = 3 }) => {
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
        outputRange: [0.3, 0.6],
    });

    const SkeletonBox = ({ width, height, style }) => (
        <Animated.View
            style={[
                styles.skeletonBox,
                { width, height, opacity: shimmerOpacity },
                style,
            ]}
        />
    );

    const renderSkeletonPost = (index) => (
        <View key={`skeleton-${index}`} style={styles.postCard}>
            <View style={styles.postContent}>
                <View style={styles.postHeader}>
                    <View style={styles.avatarContainer}>
                        <SkeletonBox
                            width={40}
                            height={40}
                            style={styles.avatarSkeleton}
                        />
                    </View>

                    <View style={styles.postHeaderText}>
                        <SkeletonBox width={120} height={15} style={{ marginBottom: 4, borderRadius: 4 }} />
                        <SkeletonBox width={60} height={13} style={{ borderRadius: 4 }} />
                    </View>

                    <SkeletonBox width={18} height={18} style={{ borderRadius: 9 }} />
                </View>

                <View style={styles.captionContainer}>
                    <SkeletonBox width="100%" height={15} style={{ marginBottom: 6, borderRadius: 4 }} />
                    <SkeletonBox width="90%" height={15} style={{ marginBottom: 6, borderRadius: 4 }} />
                    {index % 2 === 0 && (
                        <SkeletonBox width="70%" height={15} style={{ marginBottom: 8, borderRadius: 4 }} />
                    )}
                </View>

                {index % 3 !== 2 && (
                    <View style={styles.mediaWrapper}>
                        <View style={styles.mediaContainer}>
                            <SkeletonBox
                                width="100%"
                                height={280}
                                style={{ borderRadius: 12 }}
                            />
                        </View>
                    </View>
                )}

                <View style={styles.postFooter}>
                    <View style={styles.viewsContainer}>
                        <SkeletonBox width={16} height={16} style={{ borderRadius: 8 }} />
                        <SkeletonBox width={40} height={13} style={{ borderRadius: 4 }} />
                    </View>

                    <View style={styles.actionsContainer}>
                        <View style={styles.actionButton}>
                            <SkeletonBox width={20} height={20} style={{ borderRadius: 10 }} />
                            <SkeletonBox width={25} height={13} style={{ borderRadius: 4 }} />
                        </View>

                        <View style={styles.actionButton}>
                            <SkeletonBox width={19} height={19} style={{ borderRadius: 10 }} />
                            <SkeletonBox width={25} height={13} style={{ borderRadius: 4 }} />
                        </View>

                        <View style={styles.actionButton}>
                            <SkeletonBox width={19} height={19} style={{ borderRadius: 10 }} />
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />
        </View>
    );

    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => renderSkeletonPost(index))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingBottom: 20,
    },
    postCard: {
        width: '100%',
        backgroundColor: globalStyles.dark.backgroundColor,
        marginBottom: 8,
    },
    postContent: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 8,
    },

    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarContainer: {
        marginRight: 10,
    },
    avatarSkeleton: {
        borderRadius: 20,
    },
    postHeaderText: {
        flex: 1,
    },

    captionContainer: {
        marginBottom: 8,
    },

    mediaWrapper: {
        marginVertical: 8,
    },
    mediaContainer: {
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: '#1C1C1E',
    },

    postFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
        paddingTop: 8,
    },
    viewsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },

    divider: {
        height: 0.5,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginLeft: 62,
    },

    skeletonBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
});

export default PostsListSkeleton;